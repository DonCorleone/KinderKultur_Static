(function(){
  function fetch(){
	  /*
    var url = fetchUrl;
    url += '?a=300%23urZ%2f%2feZ8qrPGjmb5YTufPpwwXneXaygwwACtWVwHKRo%3d';
    url += '&b=21706%235S5eUufDWVI2jwWCGWCF4eznYt3mpOG%2fFplY3afGzj8%3d';
    url += '&c=21724%231%2bjUIABB6hSjs9TryegnU5OXmV8SmIyM6QOUb5Om4N4%3d';
    url += '&d=21731%23yTM6EURW8EPlv2AYaAYBEMKZ%2fw%2fKaZKW76bQem4Knn4%3d';

    return $.ajax({
    		type: 'GET',
    		dataType: 'json',
    		contentType: 'application/x-www-form-urlencoded',
    		url: url,
    		success: fetchSuccess,
    		error: fetchError
    	});
	*/
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

    if (item.MaxParticipants == 0){
      // freePlaces NOP
      // linkText NOP
    }else{

      if (((item.MaxParticipants - item.NotWaitingLuRefs) * -1) > (item.WaitingLuRefs)) {
        // freePlaces NOP
        // linkText NOP
      }else{
        if (item.NotWaitingLuRefs < item.MaxParticipants){
          freePlaces = 0;
//          freePlaces = item.MaxParticipants - item.NotWaitingLuRefs;
          linkText = '';
//          linkText = 'Anmelden';

          } else {
          // freePlaces NOP
          linkText = ''; // Zur Zeit keine WarteListen mehr möglich
          //  linkText = 'Warteliste';
        }
      }
    }

//    t.find('.state').append('<span class="badge">'+ 0 +'</span>').append(' Freie Plätze');
    t.find('.state').append('<span class="badge">'+ freePlaces +'</span>').append(' Freie Plätze');
    t.find('.action').append($('<a>').attr("target", "_blank").attr('href', actionUrl + '?id=' + encodeURIComponent(item.ItemId)).html(linkText));


    return $('#tblBOMData tbody').append(t);
  }

  function getTemplate() {
    return $($('#tblBOMData_Entry').clone().html());
  }

  var siteUrl = 'http://kinderkultur.crmforyou.ch/';
  var actionUrl = siteUrl + 'Portal/Veranstaltung/Details'
  var fetchUrl = siteUrl + 'BomApi/GetItems'
  fetch();
})();
