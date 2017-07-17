/*! This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

"use strict";

/*global sanitizeHtml */
/*exported capitalize, changeBodySize */
// shims to use jetpack messaging
const self = {
  port: {
    on: function(header, handle){
      browser.runtime.onMessage.addListener(function(message, sender, sendResponse){
        if (message.header == header)
          handle(message.data)
      });
    },
    emit: function(header, data){
      browser.runtime.sendMessage({header, data})
    }
  }
}

const sanitizeHtml = (m)=>{return m} // disabling the sanitization. not needed. only text from the code is sent.

function showForm(url){
  document.location.href = url;
  self.port.emit("form-opened");
}

function mergeQueryArgs(url, ...args) {
  /* currently left to right*/

  const U = new URL(url);
  let q = U.search || "?";
  q = new URLSearchParams(q);

  const merged = Object.assign({}, ...args);

  // get user info.
  Object.keys(merged).forEach((k) => {
    console.debug(q.get(k), k, merged[k]);
    q.set(k, merged[k]);
  });

  U.search = q.toString();
  return U.toString();
}

self.port.on("show-form", showForm);

self.port.on("updateEntry", function(entry){
  console.log(entry.message);

  // https://www.npmjs.com/package/sanitize-html
  let message = sanitizeHtml(entry.message, {
    allowedTags: ['h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'a', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'span'],
    allowedAttributes: {
      'span': ['class']
    }
  });
  console.log(message);
  let title = entry.title;
  let primButtonLabel = entry.primaryButtonLabel;
  let secButtonLabel = entry.secondaryButtonLabel;
  let iconSrc = entry.icon;

  document.getElementById("icon").src = iconSrc;
  document.getElementById("icon").onerror = function(){
    this.src = "images/firefox-highres.png";
  };


  document.getElementById("textbox").textContent = message;
  if (message=='') {
    document.getElementById("textbox").style="visibility:hidden";
    document.getElementById("textbox").innerHTML="Lorem ipsum dolor sit amet, vis paulo singulis elaboraret cu. Quo cu natum reque, erat adhuc per ut."
  }
  document.getElementById("header").textContent = title;  
  document.getElementById("prim-button").textContent = primButtonLabel;
  document.getElementById("sec-button").textContent = secButtonLabel;
  if (!primButtonLabel)
    document.getElementById("prim-button").classList.add('disabled');
  if (!secButtonLabel)
    document.getElementById("sec-button").classList.add('disabled');


  //setting the callback
  document.getElementById("sec-button").addEventListener("click", secButtonClick);
  document.getElementById("prim-button").addEventListener("click", primButtonClick);
  document.getElementById("close-button").addEventListener("click", closeButtonClick);

  document.body.addEventListener("mouseenter", mouseEnter);
  document.body.addEventListener("mouseleave", mouseLeave);

  document.getElementById("info-page").addEventListener("click", infoClick);

  self.port.emit("loaded");

  updatePanelSize();

});

function infoClick(e){
  self.port.emit("infoPage");
}

function caClick(e){
  if (document.getElementById("recommcontainer").classList.contains("invisible"))
    return;
}

function caMouseEnter(e){
  if (document.getElementById("recommcontainer").classList.contains("invisible"))
    return;
}

function negFbClick(e){
  let nf = document.getElementById("neg-feedback");
  if (nf.classList.contains("active")) return;

  if (nf.classList.contains("checked"))
    nf.classList.toggle("checked");
  else
    openNegFeedback();

  self.port.emit("dontliketoggle");
}

function mouseEnter(e){
  self.port.emit("mouseenter");
}

function mouseLeave(e){
  self.port.emit("mouseleave");

  if (document.getElementById("recommcontainer").classList.contains("invisible"))
    return;
}

function capitalize(string){
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function secButtonClick(){
  self.port.emit("response", "secondaryButton");
}

function primButtonClick(){
  self.port.emit("response", "primaryButton")
}

function closeButtonClick(){
  self.port.emit("closeButton");
}

function changeBodySize(panelSize){
  document.body.style.width = (panelSize.width - 2).toString() + "px";
  document.body.style.height = (panelSize.height - 3).toString() + "px";
}

function updatePanelSize(width, height){
  self.port.emit("resize", {height: height || Number(getComputedStyle(document.body).height.slice(0,-2)),
    width: width || Number(getComputedStyle(document.body).width.slice(0,-2))});
}

function openNegFeedback(){
  document.getElementById("feedbackcontainer").classList.add("visible");
  document.getElementById("recommcontainer").classList.add("invisible");
  document.getElementById("top-left-links").classList.add("visible");
  document.getElementById("info-page").classList.add("invisible");
  // document.getElementById("button-container").classList.add("feedback");
  document.getElementById("prim-button").classList.add("invisible");
  document.getElementById("sec-button").classList.add("feedback");
  document.getElementById("sec-button").textContent= "Learn more about Firefox Guide";
  document.getElementById("sec-button").classList.remove("disabled");
  document.getElementById("sec-button").removeEventListener("click", secButtonClick);
  document.getElementById("sec-button").addEventListener("click", function(e){
    self.port.emit("infoPage");
  });
  document.getElementById("neg-feedback").textContent = "I don't like this (" + document.getElementById("header").textContent + ")";
  self.port.emit("negfbopen");

  document.getElementById("topsection").style.height = '140px'; // temporary, TODO: needs a more scalable solution

  updatePanelSize();
}

function submitFeedback(){
  setTimeout(function(){
    document.getElementById("feedbackcontainer").classList.remove("visible");
    document.getElementById("thankscontainer").classList.add("visible");
    let val = document.querySelector('input[name="negfb"]:checked').value;
    self.port.emit("negfb", val);
    setTimeout(function(){
      self.port.emit("hide", "feedbacksubmission", true);
    }, 1000);
  }, 500);
}

function orderNegFb(order){

  let permIds = order.map(function(p){return "r" + p;});
  permIds.reverse(); //because of using insert before the first child

  let form = document.getElementById("feedback-form");

  permIds.forEach(function(id){
    form.insertBefore(document.getElementById(id), form.childNodes[0]);
  });
}

function likeClick(){
  let likesection = document.getElementById("likesection");
  //let like = document.getElementById("like");

  likesection.classList.toggle("checked");

  self.port.emit("liketoggle");

}

//TOTHINK: this is just a workaround
// should find a neat way to do this
function replaceCtrlCommand(options){
    let keys = document.querySelectorAll("span.key");
    if (keys)
      Array.prototype.slice.call(keys).forEach(function(elem){
        elem.textContent = elem.textContent.replace(/ctrl/i, "command");
      });
}

self.port.emit('panel-ready');