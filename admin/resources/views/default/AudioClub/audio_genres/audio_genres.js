
        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object') {
                    for (var i in json.data) {
                        var id = json.data[i].id;
                        var albums_count = json.data[i].albums_count;
                        json.data[i].operations = "<div class='col-xs-3 col-sm-8'>\n\
                                                        <a href='#' class='dropdown-toggle no_context_menu' data-toggle='dropdown'>\n\
                                                            <i class='pull-right fa fa-cog'></i>\n\
                                                        </a>\n\
                                                        <ul class='dropdown-menu pull-right'>\n\
                                                            <li>\n\
                                                                <a class='no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/edit-audio-genres' data-genresid='" + id + "' id='edit_audio_genres_" + id + "'>\n\
                                                                    <span>{{ 'Edit'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class='remove-audio-genres no_context_menu' " + (albums_count != "0" ? "disabled='disabled' warning_msg='{{ 'First, delete or modify all the albums of this genre'|trans }}'" : "") + " data-genresid='" + id + "'>\n\
                                                                    <span>{{ 'Delete'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                        </ul>\n\
                                                    </div>";
                        var name = json.data[i].name;

                        json.data[i].name = '<a class="no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/edit-audio-genres" data-genresid="'+id+'" id="edit_audio_genres_' + id + '">' + name + '</a>';
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/audio-genres-list-json"
                },
                "language": {
                    "url": "{{ app.datatable_lang_file }}"
                },

                {% if attribute(app, 'dropdownAttribute') is defined %}
                {{ main_macro.get_datatable_column(app['dropdownAttribute']) }}
                {% endif %}
                
                "bFilter": true,
                "bPaginate": true,
                "bInfo": true,
                "aoColumnDefs": [
                    { className: "action-menu", "targets": [ -1 ] },
                    {"searchable": false, "targets": [-2, -1]},
                    {"sortable": false, "targets": [-1]}
                ]
            }).prev('.dataTables_processing').hide('');
        }

        function yelp() {
            $(document).ready(function () {
                $(document).on('change keyup', '#audio_genres_name', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var _this = $(this);
                    _this.val(_this.val().replace(/^\s+/ig, '').replace(/\s{2}$/, ' '));
                    _this.next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
                    $('#modalbox button[type="submit"]').removeAttr("disabled");

                    var sendData = {
                        id: _this.prev('input[name="id"]').val(),
                        name: _this.val()
                    };

                    ajaxPostSend('{{app.request_context.baseUrl}}/{{app.controller_alias}}/check-audio-genres-name', sendData);

                    return false;
                });

                $(document).on('click', "a.main_ajax", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var _this = this;
                    $("#modalbox").data('complete', 0);
                    var sendData = $(_this).data();
                    if ($(_this).attr("disabled")) {
                        JSErrorModalBox({msg: "{{ 'Action is not available'|trans }}! " + ($(_this).attr('warning_msg') ? $(_this).attr('warning_msg') : '')});
                    } else {
                        ajaxPostSend($(_this).attr('href'), sendData, false );
                    }
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                $(document).on('click', '#add_audio_genres, a[id^="edit_audio_genres_"]', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    openModalBox($(this));
                    return false
                });

                $(document).on('click', "#modalbox button[type='reset'], #modalbox, #modalbox a.close-link, #modalbox a.close-link *", function (e) {
                    if (e.currentTarget != e.target) {
                        return;
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    JScloseModalBox();
                    return false;
                });

                $(document).on('click submit', "#modalbox button[type='submit'], #modalbox form", function (e) {
                    if (e.currentTarget != e.target) {
                        return;
                    }
                    if( !$('#audio_genres_name').val() ) {
                        $('#audio_genres_name').css('border','1px solid red');
                    } else {
                        $('#audio_genres_name').css('border','');
                        var sendData = {
                            id: $("#modalbox input[type='hidden']").val(),
                            name: $("#modalbox input[type='text']").val()
                        };

                        e.stopPropagation();
                        e.preventDefault();
                        ajaxPostSend($("#modalbox form").attr('action'), sendData, false);
                        JScloseModalBox();
                        return false;
                    }
                });

                $(document).on('click', "a.remove-audio-genres", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var _this = this;
                    if ($(_this).attr("disabled")) {
                        JSErrorModalBox({msg: "{{ 'Action is not available'|trans }}! " + ($(_this).attr('warning_msg') ? $(_this).attr('warning_msg') : '')});
                        return false;
                    }
                    JScloseModalBox();
                    $('#modalbox').find('.modal-header-name span').addClass('txt-danger').text('{{ 'Warning'|trans }}' + '!');
                    $('#modalbox').find('.devoops-modal-inner').html($("#modal_del_body").text());
                    $('#modalbox').find('.devoops-modal-bottom').html($("#modal_del_buttons").text());

                    $('#del_genre_btn').data($(_this).data());

                    $('#modalbox').show();
                    return false;
                });

                LoadDataTablesScripts(TestTable1);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);

        var addAudioGenre = function(data){
            JSSuccessModalBox(data);
            $('#datatable-1').DataTable().ajax.reload();
        };

        function openModalBox(obj){
            $('#modalbox').find('.modal-header-name span').text((obj.data('genresid')? '{{ 'Edit'|trans }}': '{{ 'Add'|trans }}') + ' {{ 'genre'|trans }}');
            if ($('#modalbox').find('.devoops-modal-inner').find('input').length == 0) {
                $('#modalbox').find('.devoops-modal-inner').html('\n\
                    <div class="box-content">\n\
                        <form class="form-horizontal" id="form" role="form">\n\
                            <div class="form-group">\n\
                                <label class="col-sm-3 control-label col-sm-offset-1">{{ 'Genre'|trans }}<span class="icon-required">*</span></label>\n\
                                <div class="col-xs-10 col-sm-8">\n\
                                    <span class="col-xs-8 col-sm-8">\n\
                                        <input type="hidden" name="id">\n\
                                        <input type="text" name="name"  class="form-control own_fields" id="audio_genres_name">\n\
                                        <div class="bg-danger"></div>\n\
                                    </span>\n\
                                </div>\n\
                            </div>\n\
                        </form>\n\
                    </div>');
                $('#modalbox').find('.devoops-modal-bottom').html('<div class=pull-right no-padding">&nbsp;</div>\n\
                            <div class="pull-right no-padding">\n\
                                <button type="submit" class="btn btn-success pull-right">{{ 'Save'|trans }}</button>\n\
                                <button type="reset" class="btn btn-default pull-right" >{{ 'Cancel'|trans }}</button>\n\
                            </div>');
            } else {
                $('#modalbox').find('.devoops-modal-inner').find('input').val('');
            }

            if (obj.data('genresid')) {
                $('#modalbox').find('.devoops-modal-inner').find('input[type="hidden"]').val(obj.data('genresid'));
                $('#modalbox').find('.devoops-modal-inner').find('input[type="text"]').val(obj.closest('tr').find('td:first a').text());
            }
            $('#modalbox button[type="submit"]').removeAttr("disabled");
            $('#audio_genres_name').next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
            $('#modalbox form').attr('action', obj.attr('href'));
            $("#modalbox").show();
            obj.closest('div.open').removeClass('open');
        }

/*
{# this templates moved to .twig file and left for demonstrate purpose only 

    <script type="text/template" id="modal_del_body">
        <div class="col-md-12">
            <span class="col-md-12 txt-default">{{ 'Do you really want delete this genre?'|trans }}</span>
        </div>
    </script>

    <script type="text/template" id="modal_del_buttons">
        <div class="pull-right no-padding">
            <a id="del_genre_btn" type="button" class="main_ajax btn btn-danger pull-right no_context_menu" href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/remove-audio-genres'>{{ 'Delete'|trans }}</a>
            <button type="reset" id="del_genre_button" class="btn btn-success pull-right">{{ 'Cancel'|trans }}</button>
        </div>
    </script>
#}*/
