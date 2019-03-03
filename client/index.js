function searchPage() {

  // Declares all relevant variables
  var input, filter, ul, li, a, i, txtValue;

  // Gets search query
  input = document.getElementById('query');

  // Makes search function case insensitive
  filter = input.value.toUpperCase();

  ul = document.getElementById("posts");
  li = ul.getElementsByTagName('li');

  // Loop through all list items, and hide those that don't match the query
  for (i = 0; i < li.length; i++) {

    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;

    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "";
    } else {
      li[i].style.display = "none";
    }

  }
}

function openForm() {
  document.getElementById("form").style.display = "block";
  document.getElementById("makePost").style.display = "none";
}

function closeForm() {
  document.getElementById("form").style.display = "none";
  document.getElementById("makePost").style.display = "block";
}
