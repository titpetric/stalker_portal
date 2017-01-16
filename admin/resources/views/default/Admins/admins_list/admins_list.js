/*
 this component has templates in .twig file
*/
        var conf = {
            form: '#karaoke_form',
            lang : '{{ app.js_validator_language }}',
            showHelpOnFocus : true,
            validateHiddenInputs: true,
            ignore: ['.ignore'],
            modules: 'jsconf, security',
            onSuccess: function () {
                var sendData = new Object();
                var form_fields = $("#modalbox_ad input.own_fields:not(:disabled), #gid:not(:disabled)");
                form_fields.each(function () {
                    if ($(this).val()) {
                        sendData[$(this).data('name')] = $(this).val();
                    }
                });

                ajaxPostSend($("#modalbox_ad form").attr('action'), sendData, false, false);
                return false;
            },
            onError: function () {
                return false;
            }
        };

        var select2Opt = {minimumResultsForSearch: -1, dropdownAutoWidth: false, width: '100%'};

        function closeModalBox(){
            $("#modalbox").hide();
            $('#modalbox').find('.modal-header-name span').empty();
            $('#modalbox').find('.devoops-modal-inner').empty();
            $('#modalbox').find('.devoops-modal-bottom').empty();
        }

        function DemoSelect2() {
            $('#gid').select2(select2Opt);
            $("#target_group").select2(select2Opt);
            $("#target_reseller").select2(select2Opt);
        }

        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object') {
                    for (var i in json.data) {
                        var id = json.data[i].id;
                        var login = json.data[i].login;
                        var group_name = (typeof(json.data[i].group_name) != 'undefined' && json.data[i].group_name)? json.data[i].group_name: '';
                        var allResellers = {};
                        {% if attribute(app, 'reseller') is defined and not app['reseller'] %}
                        {% if attribute(app, 'allResellers') is defined %}
                            {% for row in app['allResellers'] %}
                        allResellers['{{ row.id }}'] = '{{ row.name }}'{% if not(loop.last) %},{% endif %}
                            {% endfor %}
                        {% endif %}

                        var reseller_id = (typeof(json.data[i].reseller_id) != 'undefined' && json.data[i].reseller_id) ? json.data[i].reseller_id: '-';
                        var reseller_name = (typeof(json.data[i].reseller_name) != 'undefined' && json.data[i].reseller_name) ? json.data[i].reseller_name: (typeof (allResellers[reseller_id]) != 'undefined' ? allResellers[reseller_id]: '');
                        {% endif %}
                        var gid = json.data[i].gid;
                        json.data[i].operations = "<div class='col-xs-3 col-sm-8'>\n\
                                                        <a href='#' class='dropdown-toggle no_context_menu' data-toggle='dropdown'>\n\
                                                            <i class='pull-right fa fa-cog'></i>\n\
                                                        </a>\n\
                                                        <ul class='dropdown-menu pull-right'>\n\
                                                        <li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/admins-list-json' data-id='" + id + "'>\n\
                                                                    <span>{{ 'Edit'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>";
                                                        if (login != 'admin') {
                                                            {% if attribute(app, 'reseller') is defined and not app['reseller'] %}
                                json.data[i].operations += "<li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/move-admin-to-reseller' data-id='" + id +"' data-reseller_id='" + reseller_id + "'>\n\
                                                                    <span>{{ 'Change reseller for current admin'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>";
                                json.data[i].reseller_name = '<a class="main_ajax no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/move-admin-to-reseller" data-id="' + id + '" data-reseller_id="' + reseller_id + '">'+ reseller_name +'</a>';
                                                            {% endif %}
                                                            {% if attribute(app,'userlogin') is defined and app.userlogin == 'admin' %}
                                json.data[i].operations += "<li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/move-admin-to-group' data-id='" + id +"' data-group_id='" + gid + "'>\n\
                                                                    <span>{{ 'Change group for current admin'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>";
                                                            {% endif %}
                                json.data[i].operations += "<li>\n\
                                                                <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/remove-admin' data-id='" + id + "'>\n\
                                                                    <span> {{ 'Delete'|trans }} </span>\n\
                                                                </a>\n\
                                                            </li>";
                                                        }
                                json.data[i].operations += "</ul>\n\
                                                    </div>";
                        json.data[i].login = '<a class="main_ajax no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/admins-list-json" data-id="' + id + '">' + login + '</a>';
                        json.data[i].group_name = '<a href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/admins-groups-permissions?id=' + gid + '">' + group_name + '</a>';
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/admins-list-json"
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
                    {"searchable": false, "targets": [-1]},
                    {"sortable": false, "targets": [-1]}
                ]
            }).prev('.dataTables_processing').hide('');
        }

        function yelp() {
            $(document).ready(function () {
                $(document).on('click', "a.main_ajax:not([href*='move-admin-to-reseller']):not([href*='move-admin-to-group'])", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var sendData = $(this).data();
                    ajaxPostSend($(this).attr('href'), sendData, false, false);
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                $("#modalbox_ad, #modalbox ").on('click', " button[type='reset']", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $.validate();
                    $(this).closest("div[id^='modalbox").find('form').get(0).reset();
                    $(this).closest("div[id^='modalbox").hide();
                    return false;
                });

                $.validate(conf);

                $("#modalbox_ad button[type='submit']").on('click', function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    var ignore = new Array();
                    if ($('#adm_id').val() && !$("#adm_pass").val() && !$("#adm_re_pass").val()) {
                        ignore.push($("#adm_pass").prop('name'));
                        ignore.push($("#adm_re_pass").prop('name'));
                    }

                    conf.ignore = ignore;

                    if ($("#karaoke_form").isValid({}, conf, true)) {
                        conf.onSuccess();
                    } else {
                        conf.onError();
                    }
                    return false;
                });

                {% if attribute(app, 'reseller') is defined and not app['reseller'] %}
                $(document).on('click', "#modalbox button[type='submit']", function (e) {
                    var _this = $(this);

                    e.stopPropagation();
                    e.preventDefault();
                    var sendData = new Object();
                    var form_fields = _this.closest("#modalbox").find('form').find(".own_fields:not(:disabled)");
                    form_fields.each(function () {
                        if ($(this).val()) {
                            sendData[this.name] = $(this).val();
                        }
                    });
                    var action = _this.closest("#modalbox").find('form').attr('action');
                    ajaxPostSend(action, sendData, false, false);
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

                $(document).on('click', "a[href*='move-admin-to-reseller']", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $("#modalbox").data('complete', 1);
                    $('#modalbox .modal-header-name span').text("{{ 'Resellers'|trans }}");
                    var reseller_id = $(this).data('reseller_id');
                    $('#modalbox .devoops-modal-inner').html($("#modal_move_reseller_form_body").html());
                    $('#modalbox .devoops-modal-inner input[name="id"]').val($(this).data('id'));
                    $('#modalbox .devoops-modal-inner input[name="source_id"]').val(reseller_id);
                    $('#target_reseller option').removeAttr('selected');
                    $('#target_reseller option[value="'+ reseller_id +'"]').attr('selected', 'selected');
                    $('#modalbox .devoops-modal-bottom').html($("#modal_move_form_buttons").html());

                    $("#target_reseller").select2(select2Opt);

                    $("#modalbox").show();
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });
                {% endif %}

                {% if attribute(app,'userlogin') is defined and app.userlogin == 'admin' %}
                $(document).on('click', "a[href*='move-admin-to-group']", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $("#modalbox").data('complete', 1);
                    $('#modalbox .modal-header-name span').text("{{ 'Groups'|trans }}");
                    var group_id = $(this).data('group_id');
                    $('#modalbox .devoops-modal-inner').html($("#modal_move_group_form_body").html());
                    $('#modalbox .devoops-modal-inner input[name="id"]').val($(this).data('id'));
                    $('#modalbox .devoops-modal-inner input[name="source_id"]').val(group_id);
                    $('#target_group option').removeAttr('selected');
                    $('#target_group option[value="'+ group_id +'"]').attr('selected', 'selected');
                    $('#modalbox .devoops-modal-bottom').html($("#modal_move_form_buttons").html());

                    $("#target_group").select2(select2Opt);

                    $("#modalbox").show();
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                {% endif %}

                $("#add_admin").on("click", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    $("#modalbox_ad .modal-header-name span").text('{{ 'Adding administrator'|trans }}');
                    $("#adm_login").next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
                    $("#modalbox_ad input").prop("disabled", false).removeAttr('disabled').val('');
                    $("#modalbox_ad input[type='hidden']").attr('disabled', 'disabled').val('');
                    $("#modalbox_ad select[name='gid'] option").removeAttr('selected');

                    if ($("#adm_pass").closest(".form-group").children('label').find('span.icon-required').length == 0) {
                        $("#adm_pass").closest(".form-group").children('label').append('<span class="icon-required">*</span>');
                        $("#adm_re_pass").closest(".form-group").children('label').append('<span class="icon-required">*</span>');
                    }
                    $('#gid').select2(select2Opt);
                    $('#modalbox_ad button[type="submit"]').removeAttr("disabled");
                    $("#modalbox_ad").show();
                    return false;
                });

                $(document).on('change', '#adm_login', function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    var _this = $(this);
                    _this.next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
                    $('#modalbox_ad button[type="submit"]').removeAttr("disabled");
                    if (_this.val()) {
                        ajaxPostSend('{{app.request_context.baseUrl}}/{{app.controller_alias}}/check-admins-login', {login: _this.val()}, false, false);
                    }
                    return false;
                });

                LoadDataTablesScripts(TestTable1);
                LoadSelect2Script(DemoSelect2);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);

        var setAdminsModal = function (data) {
            $("#modalbox_ad .modal-header-name span").text('{{ 'Editing administrator'|trans }}');
            if (data.data.length == 1) {
                var row = data.data[0];
                for (var field_name in row) {
                    $("#modalbox_ad input[name='" + field_name + "']").val(row[field_name]);
                }
                if (typeof(row['gid']) != 'undefined' && row['gid']) {
                    $("#gid option").removeAttr('selected');
                    $("#gid option").each(function () {
                        if ($(this).val().toString() == row['gid'].toString()) {
                            $(this).attr('selected', 'selected');
                        }
                    })
                }

            }
            $("#modalbox_ad input, #modalbox_ad select").removeAttr('disabled');
            if ($("#adm_login").val() == 'admin' {% if attribute(app, 'userlogin') is defined %} || $("#adm_login").val() == "{{ app['userlogin'] }}" {% endif %}) {
                if ({% if attribute(app, 'userlogin') is defined %} $("#adm_login").val() == 'admin' && 'admin' != "{{ app['userlogin'] }}" {% else %} 0 {% endif %}) {
                    JSErrorModalBox({msg: "{{ 'You don\'t have permission for edit this record'|trans }}"});
                    return false;
                }
                $("#adm_login").attr('disabled', "disabled");
                $("#gid").attr('disabled', "disabled");
                $('#gid').prepend("<option value=0 selected='selected'></option>");
            } else {
                $('#gid option[value="0"]').remove();
            }
            $('#gid').select2(select2Opt);

            $("#adm_pass").val('').closest(".form-group").children('label').find('span.icon-required').remove();
            $("#adm_re_pass").val('').closest(".form-group").children('label').find('span.icon-required').remove();

            $('#modalbox_ad button[type="submit"]').removeAttr("disabled");
            $("#modalbox_ad").show();
        };
