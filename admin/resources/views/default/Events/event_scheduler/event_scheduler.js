
        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object' && json.data.length >0) {
                    var date;
                    for (var i in json.data) {

                        var state = json.data[i].state;

                        json.data[i].recipient = '<a class="main_ajax no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/event-scheduler-list-json" data-id="' + json.data[i].id  + '">'+ json.data[i].recipient +'</a>';

                        json.data[i].periodic = json.data[i].periodic == '0' ? '{{ 'One-time event'|trans }}' : '{{ 'For a period'|trans }}';
                        json.data[i].state = json.data[i].state != '0' ? '{{ 'Scheduled'|trans }}' : '{{ 'Stopped'|trans }}';

                        date = json.data[i]['date_begin'];
                        if (!isNaN(parseInt(date, 10)) && date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['date_begin'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }
                        date = json.data[i]['date_end'];
                        if (!isNaN(parseInt(date, 10)) && date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['date_end'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }

                        date = json.data[i]['next_run'];
                        if (!isNaN(parseInt(date, 10)) && date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['next_run'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }

                        date = json.data[i]['last_run'];
                        if (!isNaN(parseInt(date, 10)) && date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['last_run'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }

                        json.data[i].operations = '<div class="col-xs-3 col-sm-8 ddd">\n\
                                                        <a href="#" class="dropdown-toggle" data-toggle="dropdown">\n\
                                                            <i class="pull-right fa fa-cog"></i>\n\
                                                        </a>\n\
                                                        <ul class="dropdown-menu pull-right">\n\
                                                            <li>\n\
                                                                <a class="main_ajax no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/event-scheduler-list-json" data-id="' + json.data[i].id  + '">\n\
                                                                    <span>{{ 'Edit'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class="main_ajax no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/scheduler-toggle-state" data-id="' + json.data[i].id  + '" data-state="' + state  + '">\n\
                                                                    <span>' + ( state != '0' ? "{{ 'Stop it'|trans }}": "{{ 'Start it'|trans }}") + '</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class="main_ajax no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/scheduler-remove" data-id="' + json.data[i].id  + '">\n\
                                                                    <span>{{ 'Delete'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                        </ul>\n\
                                                    </div>';

                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/event-scheduler-list-json",
                    "data": function (d) {

                        d = dataTableDataPrepare(d);

                        $('input[id^="datepicker_"]').each(function () {
                            d['filters[' + $(this).attr("id").replace("datepicker_", "date_") + ']'] = $(this).val();
                        });
                    }
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
                    {"searchable": false, "targets": [0, -1]}
                ]
            }).prev('.dataTables_processing').hide('', function(){
                $('.dataTables_filter').hide('');
            });
        }

        function yelp() {
            $(document).ready(function () {
                window.stateSaveReject = true;
                LoadDataTablesScripts(TestTable1);
                    {{ main_macro.get_datepicker_js_script('notMinDate') }}
                    datePickerOpt.onClose = function(){};
                    datePickerOpt.minDate = new Date();
                    $("#date_begin, #date_end").datepicker(datePickerOpt);
                    eventsMenuHandlers();

                    $(document).on('click', '#add_events', function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        $("#modalbox_ad .devoops-modal-header span").text("{{ 'Add event into the schedule'|trans }}");
                        $("#modalbox_ad form").get(0).reset();
                        $("#modalbox_ad form input[type='hidden'][name='id']").val('');
                        $('select[id^="s2_"]').select2({minimumResultsForSearch: -1});
                        $("#modalbox_ad").show().find('input, select, textarea').removeAttr('disabled');
                        checkFields('#s2_user_list_type', e);
                        checkFields('#' + $('#s2_user_list_type').val(), e);
                        checkFields('#s2_event', e);
                        checkFields('#s2_schedule_type', e);
                        checkFields('#s2_repeating_interval', e);
                        checkFields('#date_type_day input', e);
                        switch ($("#s2_event").val()) {
                                {% if attribute(app, 'defTTL') is defined %}
                                {% for key, val in app['defTTL'] %}
                                {% if key != 'other' %}
                            case '{{ key }}': { $("#ttl").val("{{ val }}"); break; }
                                {% endif %}
                                {% endfor %}
                            default : { $("#ttl").val("{{ app['defTTL']['other'] }}"); break; }
                                {% endif %}
                        }
                        DemoSelect2();
                        return false;
                    });

                    $(document).on('click', "a.main_ajax[disabled!='disabled']", function (e) {
                        e.stopPropagation();
                        e.preventDefault();
                        $("#modalbox").data('complete', 0);
                        JSshowModalBox();
                        var sendData = $(this).data();
                        ajaxPostSend($(this).attr('href'), sendData, false, false, true);
                        $(this).closest('div.open').removeClass('open');
                        return false;
                    });

                });
            }
            document.addEventListener("DOMContentLoaded", yelp, false);

        var fillModalForm = function(data){
            JScloseModalBox();
            $("#modalbox_ad .devoops-modal-header span").text("{{ 'Edit event on the schedule'|trans }}");

            if (data.data && data.data.length) {
                var getData = data.data[0];
                $("#modalbox_ad").show().find('input, select, textarea').removeAttr('disabled').each(function(){
                    var getField = $(this).prop('name').replace('[]', '');
                    if (getField && typeof(getData[getField]) != 'undefined') {
                        $(this).removeAttr('disabled');
                        var getValue = getData[getField];
                        if ($(this).prop('tagName').toLowerCase() == 'select') {
                            $(this).find('option').removeAttr('selected').each(function(){
                                if ($(this).val() == getValue) {
                                    $(this).prop('selected', true);
                                }
                            });
                            $(this).select2({minimumResultsForSearch: -1});
                            if (getField == 'filter_set' || getField == 'event'){
                                $(this).change();
                            }
                        } else if ($(this).prop('tagName').toLowerCase() == 'input' && ($(this).prop('type').toLowerCase()=='radio' || $(this).prop('type').toLowerCase()=='checkbox')) {
                            $(this).prop('checked', $(this).val() == getValue || (getValue instanceof Array && getValue.indexOf($(this).val()) !== -1));
                        } else if ($(this).prop('tagName').toLowerCase() == 'textarea'){
                            $(this).text(getValue);
                        } else {
                            if ($(this).hasClass('hasDatepicker')) {
                                var newDate = parseInt(getValue, 10);
                                $(this).datepicker("setDate", !isNaN(newDate) && newDate > 0 ? new Date(parseInt(getValue, 10) * 1000) : null );
                            } else {
                                $(this).val(getValue);
                            }
                        }
                    }
                });
            } else {
                $("#modalbox_ad").find('input, select, textarea').removeAttr('disabled');
            }

            checkFields('#s2_user_list_type');
            checkFields('#s2_event');
            checkFields('#s2_schedule_type');
            checkFields('#s2_repeating_interval');
            checkFields('#date_type_day input');
            DemoSelect2();
            $("#modalbox_ad").show();
            return false;
        };

        var fillModalFormError = function(data){
            JSErrorModalBox(data);
        }
