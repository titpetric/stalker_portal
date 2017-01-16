
        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object') {
                    for (var i in json.data) {
                        var date = json.data[i]['modified'];
                        if (date > 0) {
                            date = new Date(date * 1000);
                            json.data[i]['modified'] = date.toLocaleFormat("%b %d, %Y %H:%M");
                        }

                        if (!json.data[i]['mac'] && json.data[i]['user_id']) {
                            json.data[i]['mac'] = json.data[i]['user_id'];
                        }

                        if (!json.data[i]['package']) {
                            json.data[i]['package'] = '---';
                        }

                        json.data[i]['state'] = json.data[i]['state'] ? '{{ app.allPackageStates[1].title }}': '{{ app.allPackageStates[0].title }}';
                        json.data[i]['mac'] = '<a href="{{ app.request_context.baseUrl }}/users/edit-users?id=' + json.data[i]['user_id'] + '">'+ json.data[i]['mac'] +'</a>';
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/subscribe-log-json"
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
                    {"searchable": false, "targets": [3, 5]}
                ]
            }).prev('.dataTables_processing').hide('');
        }

        function yelp() {
            $(document).ready(function () {
                LoadDataTablesScripts(TestTable1);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);
