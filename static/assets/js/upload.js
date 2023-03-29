var currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
  // This function will display the specified tab of the form ...
  var x = document.getElementsByClassName("tab");
  x[n].style.display = "block";
  // ... and fix the Previous/Next buttons:
  if (n == 0) {
    document.getElementById("prevBtn").style.display = "none";
  } else {
    document.getElementById("prevBtn").style.display = "inline";
  }
  if (n == (x.length - 1)) {
    document.getElementById("nextBtn").innerHTML = "Submit";
  } else {
    document.getElementById("nextBtn").innerHTML = "Next";
  }
  if (n == 2) {
    $(document).ready(function () {

      var formData = new FormData();

      formData.append('filename', $('#file').prop('files')[0].name);
      var repeater = $("input[name='guests[]']");

      console.log(repeater);
      var specifications = '';
      for (var i = 0; i < repeater.length; i++) {
        var child = repeater[i].value;
        console.log(child);
        specifications += child;
      }

      formData.append('file', $('#file').prop('files')[0]);
      formData.append('specifications', specifications);

      $.ajax({
        url: '/uploadTender',
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        success: function (data) {
          let i=0;
          console.log(data)
          $.each(data, function(index, value) {
            i=i+1;
            console.log(value);
            $('#questionTable tbody').append('<tr><td>'+i+'</td><td>'+value[1]+'</td><td><a href=/editquestion/id='+value[0]+'> <i class="bi bi-pencil-square"></i></a></td><td><a href=/deletequestion/'+value[0]+'> <i class="bi bi-trash"></i></a></td></tr>');
        });
        }
      });

    });

  }
  // ... and run a function that displays the correct step indicator:
  fixStepIndicator(n)
}

function nextPrev(n) {
  // This function will figure out which tab to display
  var x = document.getElementsByClassName("tab");
  // Exit the function if any field in the current tab is invalid:
  if (n == 1 && !validateForm()) return false;
  // Hide the current tab:
  x[currentTab].style.display = "none";
  // Increase or decrease the current tab by 1:
  currentTab = currentTab + n;
  // if you have reached the end of the form... :
  if (currentTab >= x.length) {
    //...the form gets submitted:
    document.getElementById("regForm").submit();
    return false;
  }
  // Otherwise, display the correct tab:
  showTab(currentTab);
}

function validateForm() {
  // This function deals with validation of the form fields
  var x, y, i, valid = true;
  x = document.getElementsByClassName("tab");
  y = x[currentTab].getElementsByTagName("input");
  // A loop that checks every input field in the current tab:
  for (i = 0; i < y.length; i++) {
    // If a field is empty...
    if (y[i].value == "") {
      // add an "invalid" class to the field:
      y[i].className += " invalid";
      // and set the current valid status to false:
      valid = false;
    }
  }
  // If the valid status is true, mark the step as finished and valid:
  if (valid) {
    document.getElementsByClassName("step")[currentTab].className += " finish";
  }
  return valid; // return the valid status
}

function fixStepIndicator(n) {
  // This function removes the "active" class of all steps...
  var i, x = document.getElementsByClassName("step");
  for (i = 0; i < x.length; i++) {
    x[i].className = x[i].className.replace(" active", "");
  }
  //... and adds the "active" class to the current step:
  x[n].className += " active";
}


function getRefs(el) {
  let result = {};

  [...el.querySelectorAll('[data-ref]')]
    .forEach(ref => {
      result[ref.dataset.ref] = ref;
    });

  return result;
}

function getProps(el) {
  return JSON.parse(el.dataset.props);
}

function createFromHTML(html = '') {
  let element = document.createElement(null);
  element.innerHTML = html;
  return element.firstElementChild;
}

function fieldRepeaterComponent(el) {
  const props = getProps(el);
  const refs = getRefs(el);

  let rowNumber = 1;

  function renderRow() {
    return `
        <li class="repeatable-field__row">
          <div class="repeatable-field__row-wrap">
            <input
                class="repeatable-field__input form-field"
                data-ref="input"
                type="text"
                name="${props.inputName}[]"
                aria-label="${props.labelText} #${rowNumber}"
            />
  
            <button
                class="repeatable-field__remove-button button"
                data-ref="removeButton"
                type="button"
            >
              ${props.removeLabel ?? 'Remove'}
            </button>
          </div>
        </li>
      `;
  }

  function updateLimitCounter() {
    const rowCount = refs.rowList.children.length;
    refs.limitCounter.innerText = `${rowCount}/${props.maxRows}`;
  }

  function addRow(focusInput = false) {
    if (refs.rowList.children.length >= props.maxRows)
      return;

    let newRow = createFromHTML(renderRow());
    const rowRefs = getRefs(newRow);

    rowRefs.removeButton.onclick = (e) => {
      e.preventDefault();
      removeRow(newRow);
    }

    refs.rowList.appendChild(newRow);

    if (focusInput) rowRefs.input.focus();

    if (refs.rowList.children.length >= props.maxRows) {
      refs.addButton.style.display = 'none';
    }

    rowNumber += 1;

    updateLimitCounter();
  }

  function removeRow(row) {
    if (refs.rowList.children.length <= 1)
      return;

    row.remove();
    el.focus();

    updateLimitCounter();

    if (refs.rowList.children.length < props.maxRows) {
      refs.addButton.style.display = '';
    }
  }

  function init() {
    addRow();
  }

  refs.addButton.onclick = (e) => {
    e.preventDefault();
    addRow(true);
  }

  init();
}

document.querySelectorAll('[data-component="field-repeater"]')
  .forEach(el => {
    fieldRepeaterComponent(el);
  });

var uprog = {
  // (A) INIT
  hBar: null, // html progress bar
  hPercent: null, // html upload percentage
  hFile: null, // html file picker
  init: () => {
    // (A1) GET HTML ELEMENTS
    uprog.hBar = document.getElementById("up-bar");
    uprog.hPercent = document.getElementById("up-percent");
    uprog.hFile = document.getElementById("file");
    const feedback = document.getElementById('feedback');
    // (A2) ATTACH AJAX UPLOAD + ENABLE UPLOAD
    uprog.hFile.onchange = uprog.upload;
    uprog.hFile.disabled = false;

  },

  // (B) HELPER - UPDATE PROGRESS BAR
  update: (percent) => {
    percent = percent + "%";
    uprog.hBar.style.width = percent;
    uprog.hPercent.innerHTML = percent;
    if (percent == "100%") {
      uprog.hFile.disabled = false;
    }
  },

  // (C) PROCESS UPLOAD
  upload: async () => {
    // (C1) GET FILE + UPDATE HTML INTERFACE
    let file = uprog.hFile.files[0];

    await new Promise((e) => {
      setTimeout(e, 500);
    });
    uprog.update(25);
    await new Promise((e) => {
      setTimeout(e, 500);
    });
    uprog.update(50);
    await new Promise((e) => {
      setTimeout(e, 500);
    });
    uprog.update(75);
    await new Promise((e) => {
      setTimeout(e, 500);
    });
    uprog.update(100);
    await new Promise((e) => {
      setTimeout(e, 100);
    });
    let msg = `<span style="color:green;">File <u><b>${file.name}</b></u> has been uploaded successfully.</span>`;
    feedback.innerHTML = msg;

    /* //THIS SHOULD BE THE ACTUAL AJAX UPLOAD
  // (C2) AJAX UPLOAD
  let xhr = new XMLHttpRequest(),
      data = new FormData();
  data.append("upfile", file);
  xhr.open("POST", "upload.php");
 
  // (C3) UPLOAD PROGRESS
  let percent = 0, width = 0;
  xhr.upload.onloadstart = (evt) => { uprog.update(0); };
  xhr.upload.onloadend = (evt) => { uprog.update(100); };
  xhr.upload.onprogress = (evt) => {
    percent = Math.ceil((evt.loaded / evt.total) * 100);
    uprog.update(percent);
  };
 
  // (C4) ON LOAD & ERRORS
  xhr.onload = function () {
    if (this.response!= "OK" || this.status!=200) {
      // @TODO - DO SOMETHING ON ERROR
      // alert("ERROR!");
      // reset form?
      console.log(this);
      console.log(this.response);
      console.log(this.status);
    } else {
      uprog.update(100);
      // @TODO - DO SOMETHING ON COMPLETE
    }
  };
  // xhr.onerror = () => { DO SOMETHING };
 
  // (C5) GO!
  xhr.send(data);*/
  }
};
window.addEventListener("load", uprog.init);
// Loaded via <script> tag, create shortcut to access PDF.js exports.
// Loaded via <script> tag, create shortcut to access PDF.js exports.
var pdfjsLib = window['pdfjs-dist/build/pdf'];
// The workerSrc property shall be specified.
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';