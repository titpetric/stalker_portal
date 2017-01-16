
        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                var taskState={
                {% if attribute(app,'allTaskState') is defined %}
                    {% for key, item in app.allTaskState %}
                        {% if not loop.last %}'{{ key }}':'{{item.title}}',{% else %}'{{ key }}':'{{item.title}}'{% endif %}
                    {% endfor %}
                {% endif%}
                };
                var taskStateColor=[
                {% if attribute(app,'taskStateColor') is defined %}
                    {% for item in app.taskStateColor %}
                        {% if not loop.last %}'{{item}}',{% else %}'{{item}}'{% endif %}
                    {% endfor %}
                {% endif%}
                ];
                if (typeof (json.data) == 'object') {
                    var date;
                    for (var i in json.data) {
                        var id = json.data[i].id;
                        var state = json.data[i].state;
                        var name = json.data[i].name;
                        json.data[i].name = '<a href="{{ app.request_context.baseUrl }}/tasks/task-detail-{% if app['task_type'] == 'karaoke' %}karaoke{% else %}video{% endif %}?id='+ id + '">' + name + '</a>';
                        
                        json.data[i].state = '<span class="txt-' + taskStateColor[state] + '">'+taskState[state]+'</span>';
                        if (json.data[i].archived != '0'){
                            json.data[i].state += '<br><span class="bg-' + taskStateColor[4] + '">'+taskState[4]+'</span>';
                        }
                        date = json.data[i]['start_time'];
                        if (date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['start_time'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }
                        date = json.data[i]['end_time'];
                        if (date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['end_time'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }
                        
                    }
                }
                if(typeof(json.videotime != 'undefined') && json.videotime!=-1) {
                    var hd_str = (typeof(json.videotime.hd_time) != "undefined" && json.videotime.hd_time != -1 && json.videotime.hd_time) ? " HD - " + json.videotime.hd_time + "; ": "";
                    var sd_str = (typeof(json.videotime.sd_time) != "undefined" && json.videotime.sd_time  != -1 && json.videotime.sd_time) ? " SD - " + json.videotime.sd_time + "; ": "";
                    var time_str = (hd_str || sd_str )? hd_str + sd_str: " 0 ";
                    $('#videoduration').text($('#videoduration').text().replace(/\:.*$/ig, ": " + time_str));
                }
                
            }).dataTable({
                "processing": true,   
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/stat-moderators-list-json",
                    "data": function (d) {
                        d = dataTableDataPrepare(d);
                        $('input[id^="datepicker_"]').each(function () {
                            d['filters[' + $(this).attr("id").replace("datepicker_", "interval_") + ']'] = $(this).val();
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
                "columnDefs": [
                    {"searchable": false, "targets": [-1, 3, 2, 1]},
                    {"sortable": false, "targets": [1]}
                ]
            });
        }

        function yelp() {
            $(document).ready(function () {
                {{ main_macro.get_datepicker_js_script() }}
                LoadDataTablesScripts(TestTable1);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);
