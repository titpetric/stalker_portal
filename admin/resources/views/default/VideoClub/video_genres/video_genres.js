
        var select2Opt = {minimumResultsForSearch: -1, dropdownAutoWidth: false, width: '100%'};

        function DemoSelect2() {
            $('#category_id').select2(select2Opt);
        }

        function TestTable1() {
            $('#datatable-1').on('xhr.dt', function (e, settings, json) {
                if (typeof (json.data) == 'object') {
                    for (var i in json.data) {
                        var id = json.data[i].id;
                        var movie_in_genre = parseInt(json.data[i].movie_in_genre, 10);
                        json.data[i].operations = "<div class='col-xs-3 col-sm-8'>\n\
                                                        <a href='#' class='dropdown-toggle' data-toggle='dropdown'>\n\
                                                            <i class='pull-right fa fa-cog'></i>\n\
                                                        </a>\n\
                                                        <ul class='dropdown-menu pull-right'>\n\
                                                            <li>\n\
                                                                <a href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/video-genres-list-json' class='main_ajax' data-id='" + id + "' id='edit_video_genres_" + id + "'>\n\
                                                                    <span>{{ 'Edit'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                            <li>\n\
                                                                <a class='main_ajax' " + (movie_in_genre ? "disabled='disabled'" : "") + " href='{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/remove-video-genres' data-genresid='" + id + "'>\n\
                                                                    <span>{{ 'Delete'|trans }}</span>\n\
                                                                </a>\n\
                                                            </li>\n\
                                                        </ul>\n\
                                                    </div>";
                        var title = json.data[i].title;

                        json.data[i].title = '<a href="#" >' + title + '</a>';
                    }
                }
            }).dataTable({
                "processing": true,
                "serverSide": true,
                "ajax": {
                    "url": "{{ app.request_context.baseUrl }}/{{ app.controller_alias }}/video-genres-list-json"
                },
                "language": {
                    "url": "{{ app.datatable_lang_file }}"
                },
                {% if attribute(app, 'dropdownAttribute') is defined %}
                {{ main_macro.get_datatable_column(app['dropdownAttribute']) }}
                {% endif %}
                "scrollCollapse": true,
                "bFilter": true,
                "bPaginate": true,
                "bInfo": true,
                "aoColumnDefs": [
                    { className: "action-menu", "targets": [ -1 ]},
                    { "sortable": false, "targets": [-1, 1, 2]},
                    { "searchable": false, "targets": [-2, -1, 1, 2]}
                ]
            }).prev('.dataTables_processing').hide('');
        }

        function yelp() {
            $(document).ready(function () {

                $(document).on('click', "a.main_ajax", function (e) {
                    e.stopPropagation();
                    e.preventDefault();
                    if ($(this).attr('disabled') && $(this).attr('href').search('remove-video-genres') != -1) {
                        JSErrorModalBox({msg: "{{ 'You can\'t delete genre with movies'|trans }}"});
                    } else {
                        ajaxPostSend($(this).attr('href'), $(this).data(), false);
                    }
                    $(this).closest('div.open').removeClass('open');
                    return false;
                });

                $(document).on('click', '#add_video_genres', function (e) {
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
                    closeModalBox();
                    return false;
                });

                $(document).on('click submit', "#modalbox button[type='submit'], #modalbox form", function (e) {
                    if (e.currentTarget != e.target) {
                        return;
                    }
                    var sendData = {
                        id: $("#modalbox input[type='hidden']").val(),
                        title: $("#modalbox input[name='title']").val(),
                        category_alias: $("#category_id").val()
                    };

                    e.stopPropagation();
                    e.preventDefault();
                    ajaxPostSend($("#modalbox form").attr('action'), sendData, false);
                    return false;
                });

                LoadDataTablesScripts(TestTable1);
                LoadSelect2Script(DemoSelect2);
            });
        }

        document.addEventListener("DOMContentLoaded", yelp, false);

        var manageGenre = function(data){
            JSSuccessModalBox(data);
            $('#datatable-1').DataTable().ajax.reload();
        };

        var manageGenreError = function(data){
            JSErrorModalBox(data);
        };

        var deleteGenre = function(data){
            JSshowModalBox();
            JSSuccessModalBox(data);
            $('#datatable-1').DataTable().ajax.reload();
        };

        var deleteGenreError = function(data){
            JSshowModalBox();
            JSErrorModalBox(data);
        };

        function closeModalBox(){
            $("#modalbox").hide();
            $('#modalbox').find('.modal-header-name span').empty();
            $('#modalbox').find('.devoops-modal-inner').empty();
        }

        function openModalBox(obj){
            $('#modalbox').find('.modal-header-name span').text(( obj.data instanceof Array ? '{{ 'Edit'|trans }}': '{{ 'Add'|trans }}') + ' {{ 'genre'|trans }}');
            if ($('#modalbox').find('.devoops-modal-inner').find('input').length == 0) {
                $('#modalbox').find('.devoops-modal-inner').html('\n\
                    <div class="box-content">\n\
                        <form class="form-horizontal" role="form">\n\
                            <div class="form-group">\n\
                                <label class="col-sm-3 control-label col-sm-offset-1">{{ 'Genre'|trans }}</label>\n\
                                <div class="col-xs-10 col-sm-8">\n\
                                    <span class="col-xs-8 col-sm-8">\n\
                                        <input type="hidden" name="id">\n\
                                        <input type="text" class="own_fields form-control " name="title" id="video_title">\n\
                                        <div class="bg-danger"></div>\n\
                                    </span>\n\
                                </div>\n\
                                <label class="col-sm-3 control-label col-sm-offset-1">{{ 'Category'|trans }}</label>\n\
                                <div class="col-xs-10 col-sm-8">\n\
                                    <span class="col-xs-8 col-sm-8">\n\
                                        <select name="category_alias" class="populate placeholder" id="category_id">\n\
                                        {% if attribute(app, 'allCategories') is defined %}
                                            {% for cat_item in app.allCategories %}
                                            <option value="{{ cat_item.category_alias }}">{{ cat_item.category_name }}</option>\n\
                                            {% endfor %}
                                        {% endif %}
                                        </select>\n\
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
            }

            if (obj.data instanceof Array) {
                $('#modalbox').find('.devoops-modal-inner').find('input[type="hidden"]').val(obj.data[0].id);
                $('#modalbox').find('.devoops-modal-inner').find('input[name="title"]').val(obj.data[0].title);
                $('#category_id option[value="' + obj.data[0].category_alias + '"]').prop('selected', 'selected');
            }

            $('#category_id').select2(select2Opt);

            $('#modalbox button[type="submit"]').removeAttr("disabled");
            $('#video_title').next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
            $('#video_num').next('div').removeClass('bg-danger').css('visibility', 'hidden').html('&nbsp;');
            $('#modalbox form').attr('action', "{{app.request_context.baseUrl}}/{{app.controller_alias}}/save-video-genres");
            $("#modalbox").show();
        }
