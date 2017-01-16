
        function TestTable1() {
            var visibleCols = $('#datatable-1 tr:first-of-type th:visible');
            {% if app['filters']['stat_to'] == 'all' %}
                var colNum = (visibleCols.length > 3) ? 3: visibleCols.length - 1;
            {% else %}
                var colNum = visibleCols.length - 1;
            {% endif %}
            
            $('#datatable-1')
            {% if app['filters']['stat_to'] != 'genre' %}
                    .on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object' && json.data.length > 0) {
                    var dateKey = false, key, date;
                    var possibleDateKeys = ['date', 'last_played'];
                    for (var num in possibleDateKeys) {
                        key = possibleDateKeys[num];
                        if (typeof(json.data[0][key]) != 'undefined') {
                            dateKey = key;
                        }
                    }
                    if (dateKey) {
                        for (var i in json.data) {
                            date = json.data[i][dateKey];
                            if (date > 0) {
                                date = new Date(date * 1000);
                                json.data[i][dateKey] = date.toLocaleFormat("%b %d, %Y %H:%M");
                            }
                        }
                    }
                }
            })
            {% endif %}
                .dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/stat-video-list-json",
                    "data": function (d) {
                        d = dataTableDataPrepare(d);
                        $('input[id^="datepicker_"]').each(function () {
                            d['filters[' + $(this).attr("id").replace("datepicker_", "interval_") + ']'] = $(this).val();
                        });
                    }
                },
            {% if app['filters']['stat_to'] != 'genre' %}
            {% else %}
                /*"serverSide": false,*/
                "pageLength": 100,
            {% endif %}
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
                    {"searchable": false, "targets": [{% if app['filters']['stat_to'] == 'all' %}4{% elseif app['filters']['stat_to'] == 'daily' %}1{% else %}0, 3{% endif %}]} {% if app['filters']['stat_to'] == 'genre' %},
                    {"sortable": false, "targets": [0]}
                    {% endif %}
                ]
            }).prev('.dataTables_processing').hide('', function(){
                {% if app['filters']['stat_to'] == 'genre' %}
                    $(".dataTables_filter").hide();
                {% endif %}
            });
        }

        function yelp() {
            $(document).ready(function () {
                {{ main_macro.get_datepicker_js_script() }}
                LoadDataTablesScripts(TestTable1);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);
