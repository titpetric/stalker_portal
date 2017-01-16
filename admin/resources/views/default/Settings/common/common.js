
        var select2Opt = {minimumResultsForSearch: -1, dropdownAutoWidth: false, width: '100%'};

        var conf = {
            form: '#karaoke_form',
            lang : '{{ app.js_validator_language }}',
            showHelpOnFocus : true,
            validateHiddenInputs: true,
            ignore: ['.ignore'],
            modules: 'jsconf',
            onSuccess: function () {
                var sendData = new Object();
                var form_fields = $("#modalbox_ad input.own_fields:not(:disabled), #modalbox_ad  select");
                form_fields.each(function () {
                    if (typeof($(this).attr('type')) != 'undefined' && $(this).attr('type').toLowerCase() == 'checkbox') {
                        sendData[this.name] = $(this).prop('checked') ? 1: 0;
                    } else {
                        sendData[this.name] = $(this).val();
                    }
                });
                ajaxPostSend($("#modalbox_ad form").attr('action'), sendData, false, false);
                return false;
            },
            onError: function () {
                return false;
            }
        };

        function DemoSelect2() {
            $('select[id^="s2_"]').select2(select2Opt);
        }

        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object') {
                    var date;
                    for (var i in json.data) {
                        var id = json.data[i].id;
                        var enable = json.data[i].enable;
                        json.data[i].enable = (enable == 1 ?"<span class='txt-success'>{{ 'on'|trans }}</span>":"<span>{{ 'off'|trans }}</span>");

                        date = json.data[i]['require_image_date'];
                        if (date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['require_image_date'] = date.toLocaleFormat("%b %d, %Y");
                        }

                        json.data[i].operations = "<div class='col-xs-3 col-sm-8'>\n\
                                                        <a href='#' class='dropdown-toggle no_context_menu' data-toggle='dropdown'>\n\
                                                            <i class='pull-right fa fa-cog'></i>\n\
                                                        </a>\n\
                                                        <ul class='dropdown-menu pull-right'>\n\
                                                            <li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/common-list-json' data-id='" + id + "'>\n\
                                                                    <span>{{ 'Edit'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/toggle-common-item-status' data-id='" + id + "' data-enable='" + enable + "'>\n\
                                                                    <span>"+ (enable == 1? '<span>{{ 'Switch off'|trans }}</span>':'<span>{{ 'Switch on'|trans }}</span>') + "</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/remove-common-item' data-id='" + id + "'>\n\
                                                                    <span> {{ 'Delete'|trans }} </span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                        </ul>\n\
                                                    </div>";
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/common-list-json"
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
                "columnDefs": [
                    { className: "action-menu", "targets": [ -1 ] },
                    {"searchable": false, "targets": [-1, -3, 3]},
                    {"sortable": false, "targets": [-1]}
                ]
            });
        }

        function yelp() {
            $(document).ready(function () {
                $.validate(conf);
                $(document).on('click', "a.main_ajax[disabled!='disabled']", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $("#modalbox").data('complete', 0);
                    var sendData = $(this).data();
                    ajaxPostSend($(this).attr('href'), sendData, false, false);
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                $("#form_reset").on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $(this).closest('form').get(0).reset();
                    return false;
                });
                
                $("#modalbox_ad button[type='submit']").on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    if ($(conf.form).isValid({}, conf, true)) {
                        conf.onSuccess();
                    } else {
                        conf.onError();
                    }
                    return false;
                });
                $("#Additional").hide('fast');
                $(document).on('click', "#modalbox, #modalbox a.close-link, #modalbox a.close-link *", function(e){
                    if (e.currentTarget != e.target) {
                        return;
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    if ($("#modalbox").data('complete') && $("#modalbox").data('complete') == 1) {
                        JScloseModalBox();
                    } else {
                        for(i=0;i<3;i++) {
                            $('#modalbox > div').fadeTo('slow', 0.5).fadeTo('slow', 1.0);
                        }
                    }
                    return false;
                });
                
                $("#add_common_item").on("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    JScloseModalBox();
                    $.validate();
                    $(conf.form).get(0).reset();
                    $("#modalbox_ad").find(".modal-header-name").children('span').text('{{ 'Add update'|trans }}');
                    $("#modalbox_ad .own_fields").prop("disabled", false).removeAttr('disabled').val('');
                    $("#modalbox_ad input[type='hidden']").attr('disabled', 'disabled').val('');
                    $("select[id^='s2_']").select2(select2Opt);
                    $("#modalbox_ad").show();
                    return false;
                });
                               
                LoadDataTablesScripts(TestTable1);
                LoadSelect2Script(DemoSelect2);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);
        
        var setCommonModal = function (data) {
            JScloseModalBox();
            $.validate();
            $(conf.form).get(0).reset();
            $("#modalbox_ad").find(".modal-header-name").children('span').text('{{ 'Edit update'|trans }}');
            if (data.data.length == 1) {
                var row = data.data[0];
                for (var field_name in row) {
                    if ($("#modalbox_ad .own_fields[name='" + field_name + "']").attr('type') != 'checkbox') {
                        $("#modalbox_ad .own_fields[name='" + field_name + "']").val(row[field_name]);
                    } else {
                        $("#modalbox_ad .own_fields[name='" + field_name + "']").prop('checked', row[field_name] == 1).attr('checked', row[field_name] == 1);
                    }
                }
            }
            $("#modalbox_ad input").removeAttr('disabled');
            $("select[id^='s2_']").select2(select2Opt);
            $("#modalbox_ad").show();
        };
