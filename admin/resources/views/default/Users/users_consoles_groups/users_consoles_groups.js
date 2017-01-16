
/*
 this component has templates in .twig file
*/
        {% if attribute(app, 'reseller') is defined and not app['reseller'] %}

            var select2Opt = {minimumResultsForSearch: -1, dropdownAutoWidth: false, width: '100%'};

            function DemoSelect2() {
                $("[id^='s2_']").select2(select2Opt);
            }

        {% endif %}

        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object') {
                    for (var i in json.data) {
                        json.data[i] = getCeils(json.data[i]);
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/users-consoles-groups-list-json"
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
                    {"searchable": false, "targets": [-1]},
                    {"sortable": false, "targets": [-1]}
                ]
            }).prev('.dataTables_processing').hide('');
        }

        function yelp() {
            $(document).ready(function () {
                
                $(document).on('change', '#console_name', function(e){

                    var sendData = {
                        name: $(this).val(),
                        id: $("#modalbox input[name='id']").val()
                    };

                    ajaxPostSend("{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/check-console-name", sendData, false, false);

                });
                
                $(document).on('click', "a.main_ajax", function (e) {
                    e.stopPropagation();
                    e.preventDefault();

                    ajaxPostSend($(this).attr('href'), $(this).data());
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });
                
                $(document).on('click', '#add_console_group, a[id^="edit_console_group_"]', function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    openModalBox($(this));
                    return false
                });

                {% if attribute(app, 'reseller') is defined and not app['reseller'] %}
                $(document).on('click', "a[href*='move-user-group-to-reseller']", function(e){
                    e.stopPropagation();
                    e.preventDefault();
                    $("#modalbox").data('complete', 1);
                    $('#modalbox').find('.modal-header-name span').text("{{ 'Resellers'|trans }}");
                    var reseller_id = $(this).data('reseller_id');

                    $('#modalbox .devoops-modal-inner').html($("#modal_change_reseller_form").html());
                    $('#modalbox .devoops-modal-inner input[name="consolegroupid"]').val($(this).data('consolegroupid'));

                    $('#target_reseller option').removeAttr('selected');
                    $('#target_reseller option[value="'+ reseller_id +'"]').attr('selected', 'selected');

                    $('#modalbox .devoops-modal-bottom').html($("#modal_form_buttons").html());
                    $('#modalbox .devoops-modal-bottom button[type="submit"]').text("{{ 'Move'|trans }}");

                    $("#target_reseller").select2(select2Opt);

                    $("#modalbox").show();
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                LoadSelect2Script(DemoSelect2);

                {% endif %}

                $(document).on('click', "#modalbox button[type='reset'], #modalbox, #modalbox a.close-link, #modalbox a.close-link *", function(e){
                    if (e.currentTarget != e.target) {
                        return;
                    }
                    e.stopPropagation();
                    e.preventDefault();

                    JScloseModalBox();

                    return false;
                });

                $(document).on('click', "#modalbox button[type='submit']", function (e) {
                    var sendData = {};

                    $("#modalbox").find('input.own_fields, select.own_fields').each(function(){
                        sendData[$(this).attr('name')] = $(this).val();
                    });

                    e.stopPropagation();
                    e.preventDefault();
                    ajaxPostSend($("#modalbox form").attr('action'), sendData);
                    JScloseModalBox();
                    return false;
                });
                LoadDataTablesScripts(TestTable1);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);

        var manageList = function (obj) {
            $("#modalbox_ad").click();
            JSSuccessModalBox(obj);
            $('#datatable-1').DataTable().ajax.reload();
        };

        var manageListError = function (obj) {
            JSErrorModalBox(obj);
        };

    
    function openModalBox(obj){
        $('#modalbox .modal-header-name span').text((obj.data('consolegroupid')? "{{ 'Edit'|trans }}": "{{ 'Add'|trans }}") + ' {{ 'group'|trans }}');
        $('#modalbox .devoops-modal-inner').html($("#modal_group_name_form").html());
        $('#modalbox .devoops-modal-bottom').html($("#modal_form_buttons").html());

        if (obj.data('consolegroupid')) {
            $('#modalbox .devoops-modal-inner input[type="hidden"]').val(obj.data('consolegroupid'));
            $('#modalbox .devoops-modal-inner input[type="text"]').val(obj.data('consolegroupname'));
        }
        $('#modalbox button[type="submit"]').removeAttr("disabled");
        $('#console_name').next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
        $('#modalbox form').attr('action', obj.attr('href'));
        $("#modalbox").show();
        obj.closest('div.open').removeClass('open');
    }

    function getCeils(data){
        var resellers = {};
        {% if attribute(app, 'allResellers') is defined %}
        {% for item in app.allResellers %}
        resellers['{{ item.id }}'] = '{{ item.name }}';
        {% endfor %}
        {% endif %}
        var ceils = {};
        ceils.RowOrder = data.RowOrder;
        ceils.name = '<a href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/users-groups-consoles-list?id='+data.id+'">'+data.name+'</a>';
        var reseller_id = '' + (typeof (data.reseller_id) != 'undefined' ? data.reseller_id: '-') + '';
        ceils.users_count  = data.users_count;
        ceils.reseller_name = '<a class="no_context_menu" href="{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/move-user-group-to-reseller" data-consolegroupid="'+data.id+'" data-reseller_id="'+reseller_id+'">' + resellers[reseller_id] + '</a>';
        ceils.operations = "<div class='col-xs-3 col-sm-8'>\n\
                                <a href='#' class='dropdown-toggle no_context_menu' data-toggle='dropdown'>\n\
                                    <i class='pull-right fa fa-cog'></i>\n\
                                </a>\n\
                                <ul class='dropdown-menu pull-right'>\n\
                                    <li>\n\
                                        <a class='no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/edit-console-group'  id='edit_console_group_"+data.id+"' data-consolegroupid='" + data.id + "' data-consolegroupname='" + data.name + "'>\n\
                                            <span>{{ 'Edit'|trans }}</span>\n\
                                        </a>\n\
                                    </li>\n\
                                    <li>\n\
                                        <a class='main_ajax no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/remove-console-group' data-consolegroupid='" + data.id + "'>\n\
                                            <span>{{ 'Delete'|trans }}</span>\n\
                                        </a>\n\
                                    </li>";
        {% if attribute(app, 'reseller') is defined and not app['reseller'] %}
        ceils.operations        += "<li>\n\
                                        <a class='no_context_menu' href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/move-user-group-to-reseller' data-consolegroupid='" + data.id + "' data-reseller_id='"+reseller_id+"'>\n\
                                            <span>{{ 'Change reseller for current group'|trans }}</span>\n\
                                        </a>\n\
                                    </li>\n\
                                </ul>\n\
                            </div>";
        {% endif %}
        return ceils;
    }
