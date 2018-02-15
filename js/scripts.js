(function(){
  function fetch(){
}
  function fetchError(){ return alert('error fetiching'); }
  function fetchSuccess(items){ return prepare(items); }

  function prepare(items){
    $('#tblBOMData tbody').empty();
    return $.each(items, render);
  }

  function render(key, val) {
    var item = val;
    var t = getTemplate();

    t.find('.week').html(item.ItemText1);
    t.find('.date').html(item.From.Date + ' - ' + item.To.Date);

    var freePlaces = 0;
    var linkText = '';

    t.find('.state').append('<span class="badge">'+ freePlaces +'</span>').append(' Freie Plätze');
    t.find('.action').append($('<a>').attr("target", "_blank").attr('href', actionUrl + '?id=' + encodeURIComponent(item.ItemId)).html(linkText));


    return $('#tblBOMData tbody').append(t);
  }

  function getTemplate() {
    return $($('#tblBOMData_Entry').clone().html());
  }

  var siteUrl = 'http://kinderkultur.crmforyou.ch/';
  var actionUrl = siteUrl + 'Portal/Veranstaltung/Details';
  var fetchUrl = siteUrl + 'BomApi/GetItems';
  fetch();
})();
