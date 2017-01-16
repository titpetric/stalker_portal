
        var conf = {
            form: '#anek_form',
            lang : '{{ app.js_validator_language }}',
            showHelpOnFocus : true,
            validateHiddenInputs: true,
            ignore: ['.ignore'],
            modules: 'jsconf',
            onSuccess: function () {
                var sendData = new Object();
                var lengthObj = 0;
                var form_fields = $("#modalbox_ad .own_fields:not(:disabled)");
                form_fields.each(function () {
                    if ($(this).val()) {
                        sendData[this.name] = $(this).val();
                        lengthObj++;
                    }
                });
                if (lengthObj < form_fields.length) {
                    JSErrorModalBox({msg: '{{ 'All fields is required'|trans }}'});
                    return false;
                }
                ajaxPostSend($("#modalbox_ad form").attr('action'), sendData, false, false);
                return false;
            },
            onError: function () {
                return false;
            }
        };

        function closeModalBox(){
            $("#modalbox").hide();
            $('#modalbox').find('.modal-header-name span').empty();
            $('#modalbox').find('.devoops-modal-inner').empty();
            $('#modalbox').find('.devoops-modal-bottom').empty();
        }

        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object' && json.data.length >0) {
                    var date;
                    for (var i in json.data) {
                        var id = json.data[i].id;

                        json.data[i].anec_body = json.data[i].anec_body.substr(0, 50) + (json.data[i].anec_body.length > 50 ? '...': '');
                        json.data[i].operations = "<div class='col-xs-3 col-sm-8'>\n\
                                                        <a href='#' class='dropdown-toggle no_context_menu' data-toggle='dropdown'>\n\
                                                            <i class='pull-right fa fa-cog'></i>\n\
                                                        </a>\n\
                                                        <ul class='dropdown-menu pull-right'>\n\
                                                            <li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/humor-list-json' data-id='" + id + "'>\n\
                                                                    <span>{{ 'Edit'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/remove-humor-item' data-id='" + id + "'>\n\
                                                                    <span> {{ 'Delete'|trans }} </span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                        </ul>\n\
                                                    </div>";
                        date = json.data[i]['added'];
                        if (date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['added'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/humor-list-json"
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
                    {"searchable": false, "targets": [-1, 1]},
                    {"sortable": false, "targets": [-1]}
                ]
            }).prev('.dataTables_processing').hide('');
        }

        function yelp() {
            $(document).ready(function () {

                $.validate(conf);

                $(document).on('click', "a.main_ajax[disabled!='disabled']", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var sendData = $(this).data();
                    ajaxPostSend($(this).attr('href'), sendData, false, false);
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                $("#form_reset").on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $(this).closest('form').get(0).reset();
                    /*$("#cmd_data").find("tr:visible").remove();*/
                    return false;
                });
                
                $("#modalbox_ad button[type='submit']").on('click', function (e) { 
                    e.stopPropagation();
                    e.preventDefault();

                    if ($("#anek_form").isValid({}, conf, true)) {
                        conf.onSuccess();
                    } else {
                        conf.onError();
                    }
                    return false;
                });
                
                $(document).on('click', "#modalbox, #modalbox a.close-link, #modalbox a.close-link *", function(e){
                    if (e.currentTarget != e.target) {
                        return;
                    }
                    e.stopPropagation();
                    e.preventDefault();
                    closeModalBox();
                    return false;
                });
                
                $("#add_humor_item").on("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $.validate();
                    $('#anek_form').get(0).reset();
                    $("#modalbox_ad").find(".modal-header-name").children('span').text('{{ 'Adding'|trans }}');
                    $("#modalbox_ad .own_fields").prop("disabled", false).removeAttr('disabled').val('');
                    $("#modalbox_ad input[type='hidden']").attr('disabled', 'disabled').val('');
                    $("#modalbox_ad").show();
                    //        $(this).closest('.form-group').find('tbody tr:hidden').show();
                    return false;
                });
                
                LoadDataTablesScripts(TestTable1);

            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);
        
        var setHumorModal = function (data) {
            $("#modalbox_ad").find(".modal-header-name").children('span').text('{{ 'Edit'|trans }}');
            if (data.data.length == 1) {
                var row = data.data[0];
                for (var field_name in row) {
                    $("#modalbox_ad .own_fields[name='" + field_name + "']").val(row[field_name]);
                }
            }
            $("#modalbox_ad input").removeAttr('disabled');
            $("#modalbox_ad").show();
        };
