/*
 * jQuery File Upload Plugin JS Example 6.7
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/*jslint nomen: true, unparam: true, regexp: true */
/*global $, window, document */

$(function () {
    'use strict';

    // Initialize the jQuery File Upload widget:
    $('#fileupload').fileupload();

    // Enable iframe cross-domain access via redirect option:
    $('#fileupload').fileupload(
        'option',
        'redirect',
        window.location.href.replace(
            /\/[^\/]*$/,
            '/cors/result.html?%s'
        )
    );

    if (window.location.hostname === 'blueimp.github.com') {
        // Demo settings:
        $('#fileupload').fileupload('option', {
            url:'//jquery-file-upload.appspot.com/',
            maxFileSize:5000000,
            acceptFileTypes:/(\.|\/)(gif|jpe?g|png)$/i,
            process:[
                {
                    action:'load',
                    fileTypes:/^image\/(gif|jpeg|png)$/,
                    maxFileSize:20000000 // 20MB
                },
                {
                    action:'resize',
                    maxWidth:1440,
                    maxHeight:900
                },
                {
                    action:'save'
                }
            ]
        });
        // Upload server status check for browsers with CORS support:
        if ($.support.cors) {
            $.ajax({
                url:'//jquery-file-upload.appspot.com/',
                type:'HEAD'
            }).fail(function () {
                    $('<span class="alert alert-error"/>')
                        .text('Upload server currently unavailable - ' +
                        new Date())
                        .appendTo('#fileupload');
                });
        }
    } else {
        // Load existing files:
        $('#fileupload').each(function () {
            var that = this;
            $.getJSON(this.action, function (result) {
                if (result && result.length) {
                    $(that).fileupload('option', 'done')
                        .call(that, null, {result:result});
                }
            });
        });
    }

function dump(obj) {
    var out = '';
    for (var i in obj) {
        out += i + ": " + obj[i] + "\n";
    }
    return out;
}

    // This code assumes each file upload has a related DOM node
    // set as data.context, which is true for the UI version:
    $('#fileupload').bind('fileuploadsend',
        function (e, data) {
            // This feature is only useful for browsers which rely on the iframe transport:
            if (data.dataType.substr(0, 6) === 'iframe') {
                // Set PHP's session.upload_progress.name value:
                var progressObj = {
                    name:'PHP_SESSION_UPLOAD_PROGRESS',
                    value:(new Date()).getTime()  // pseudo unique ID
                };
                data.formData.push(progressObj);
                // Start the progress polling:
                data.context.data('interval', setInterval(function () {
                    $.get('progress.php', $.param([progressObj]), function (result) {
                        // Trigger a fileupload progress event,
                        // using the result as progress data:
                        e = document.createEvent('Event');
                        e.initEvent('progress', false, true);
                        $.extend(e, result);
                        var t = $('#fileupload').data('fileupload');
                        t._total = result.total;
                        t._loaded = result.loaded;
                        t._onProgress(e, data);
                    }, 'json');
                }, 500)); // poll every second
            }
        }).bind('fileuploadalways', function (e, data) {
            clearInterval(data.context.data('interval'));
        });

});
