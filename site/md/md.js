//var vars = getUrlVars();
//var base_url =  getUpperUrl(vars['file']);

var name = theData["name"];
var doc_str = theData["content"];
var base_url  = theData["baseUrl"];
var bib_filename = "tex.bib";
var bib_str = "";
var $content = $("#content");

// ************** String Pattern Matching  *****************
// $x_1$
function replace_dor(string){ 
  var pattern = /\$(.*?)\$/g;
  string = string.replace(pattern, function(match, group){
      //console.log(group);
      var html = katex.renderToString(group, {
        throwOnError: false
      });
      return html;
  });
  return string;
}

// $$x_1$$
function replace_ddor(string){
  var pattern = /\$\$(.*?)\$\$/g;
  string = string.replace(pattern, function(match, group){
      //console.log(group);
      var html = katex.renderToString(group, {
        throwOnError: false
      });
      return "<p class='center'>"+html+"</p>";
  });
  return string;
}

// [@abc]
function get_ekeys(string){
  var pattern = /\[\@(.*?)\]/g;
  var res = [];
  var m;
  do {
      m = pattern.exec(string);
      if (m) {
        //console.log(m[1]);
        res.push(m[1]);
      }
  } while (m);
  return res;
}

// [@abc] => <a>
function replace_ekeys(string){
  var pattern = /\[\@(.*?)\]/g;
  string = string.replace(pattern, function(match, group){
      //console.log(group);
      var id = "#entry_"+group;
      var idx = $(id).parent().index() + 1;
      return "<a href='"+id+"'>["+idx.toString()+"]</a>";
  });
  return string;
}

var mer_idx = 0;
var mer_dict = {};

//{mermaid}...{/mermaid} => {mermaid#id}
function inspect_mer(string){
  var pattern = /\{ *mermaid *\}(.*?)\{\/ *mermaid *\}/sg;
  string = string.replace(pattern, function(match, group){
      mer_id = "mer_" + (mer_idx++).toString();
      mer_dict[mer_id] = group.trim("\n");
      //console.log(mer_dict);
      return "{mermaid#"+mer_id+"}";
  });
  return string;
}

//{mermaid#id} => mermaid div
function replace_mer(string){
  var pattern = /\{mermaid#(.*?)\}/g;
  string = string.replace(pattern, function(match, group){
      return "<div class='img' id='"+group+"'>"+""+"</div>";
  });
  return string;
}

//{%url%} for picture display 
function replace_url(string){
  var pattern = /\{\%(.*?)\%\}/g;
  //console.log(string);
  string = string.replace(pattern, function(match, group){
    if(group.trim() == "url"){
      return base_url;
    }
    return "";
  });
  return string
}

//{J.../} => <span class="japanese"></span>
function replace_jap(string, cla="japanese"){
  var pattern = /\{J(.*?)\/\}/sg;
  string = string.replace(pattern, function(match, group){
      return '<span class="' + cla + '">'+group.trim()+'</span>';
  });
  return string;
}

//{RJ.../...} => ruby japanese
function replace_rubJap(string, cla="japanese"){
  var pattern = /\{RJ *(.*?)\/(.*?) *\}/sg;
  string = string.replace(pattern, function(match, group, group1){
      return '<ruby class="ruby"><span class="'+ cla +'">'+ group.trim(" ") + '</span><rp>(</rp><rt>' + group1.trim(" ") +'</rt><rp>)</rp></ruby>';
  });
  return string;
}

//{R.../...} => ruby
function replace_rub(string, cla=""){
  var pattern = /\{R *(.*?)\/(.*?) *\}/sg;
  string = string.replace(pattern, function(match, group, group1){
      return '<ruby class="ruby"><span class="'+ cla +'">'+ group.trim(" ") + '</span><rp>(</rp><rt>' + group1.trim(" ") +'</rt><rp>)</rp></ruby>';
  });
  return string;
}

// ************** Customize mared img *****************
// ![](url/to/img.png"100x100")
function custom_img(){
  var renderer = new marked.Renderer();
  function sanitize(string) {
    return string.replace(/&<"/g, function (m) {
      if (m === "&") return "&amp;";
      if (m === "<") return "&lt;";
      return "&quot;";
    })
  }
  renderer.image = function (src, title, alt) {
    var exec = /=\s*(\d*)\s*x\s*(\d*)\s*$/.exec(title);
    var res = '<p class="img"><img src="' + sanitize(src) + '" alt="' + sanitize(alt);
    if (exec && exec[1]) res += '" height="' + exec[1];
    if (exec && exec[2]) res += '" width="' + exec[2];
    return res + '"/></p>';
  }
  marked.setOptions({renderer: renderer});
}

// ************** library actions *****************
// marked js
function marked_js(doc_string){
  custom_img();
  var marked_str = replace_jap(replace_rub(replace_rubJap(replace_dor(replace_ddor(replace_ekeys(replace_mer(marked(replace_url(inspect_mer(doc_str))))))))));
  //console.log("MARKED STR:");
  //console.log(marked_str);
  $content.html(marked_str);
}

// highlight js
function highlight_js(){
  hljs.configure({
    tabReplace: '    ', // 4 spaces
  });
  document.querySelectorAll('pre code').forEach((block) => {
    hljs.highlightBlock(block);
  });
}

// mermaid js
function mermaid_js(){
  mermaid.initialize({startOnLoad:true,logLevel:'error'});
  for(var key in mer_dict){
    var element = document.getElementById(key);
    var svgcode = mermaid.render(key+"_abc", mer_dict[key]);
    //console.log("SVG code length for key=" + key + ":" + svgcode.length);
    if($("#d"+key+"_abc").length){
      svgcode = $("#d"+key+"_abc").html();
    }
    $("#"+key).append(svgcode);
    $("#d"+key+"_abc").remove();
  }
}

// bibtext js
function bibtext_js(){
    var ekeys = get_ekeys(doc_str);
    displayWithKeys(ekeys);
    var get_bib = createWebPage(bib_str);
    return get_bib
}

// Hurify
function hurify(){
  var kuroshiro = new Kuroshiro();
  var init = kuroshiro.init(new KuromojiAnalyzer());
  var $eles = $(".japanese");
  $eles.each(function(){
    var html = $(this).html();
    var $ele = $(this);
    $.when(init).then(function(){
      //console.log(html);
      return kuroshiro.convert(html, {mode:"furigana", to:"hiragana"});
    }).then(function(huri){
      $ele.html(huri)
    });
  });
}

// Colorify 
function get_color(text) {
  //console.log(text);
    var COLORS = [ 'DARKKHAKI',
        'green', 'red', 'blue', 'purple',
        'chocolate', 'orange',
        'olive', 'MEDIUMVIOLETRED',
    ];
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < text.length; i++) {
        hash = text.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
}

function colorify(){
  var $eles = $(".ruby");
  $eles.each(function(idx, ele){
    var color = get_color($(ele).html());
    $(ele).css("color", color);
  });
}

//extract file name
function extract_filename(str){
  var arr = str.split("/");
  return arr[arr.length - 1];
}

// Request files in url parameters
function request_files(){
  var res = [];
  // md file
  if ("file" in vars){
    var get_doc = $.ajax({ url: vars['file'], success: function(data) {
          doc_str = data;
          document.title = extract_filename(vars["file"]);
        }
    });
    res.push(get_doc);
  }
  // bib text file
  if("bib" in vars){
    var get_bib_url = $.ajax({ url: vars['bib'], success: function(data){
          if(data != ""){
            bib_str = data;
            //console.log("bib_str:");
            //console.log(bib_str);
            }
        } 
    });
    res.push(get_bib_url);
  }
  return res;
}

function request_bib(){
  var url = base_url + bib_filename;
  return $.ajax({url:url, 
            success: function(data){
                      if(data != ""){
                        bib_str = data;
                      }
                    },
            error: function(){
              renderMdContent();
            }
        });
}

/*
$.when.apply($, request_files()).then(function(){
    // Bibtex js
    var get_bib = bibtext_js();
    $.when.apply($, [get_bib]).then(function(){
      // Marked js
      marked_js(doc_str);
      // Highlight js
      highlight_js();
      // Mermaid js
      mermaid_js();
      // Hurify
      hurify();
      // Colorify
      colorify();
  });
});*/

$(function(){ 
  document.title = name;
 $.when(request_bib()).then(function(){ 
    renderMdContent();
  });  
});

function renderMdContent(){
    var get_bib = bibtext_js();
    $.when.apply($, [get_bib]).then(function(){
      // Marked js
      marked_js(doc_str);
      // Highlight js
      highlight_js();
      // Mermaid js
      mermaid_js();
      // Hurify
      hurify();
      // Colorify
      colorify();
    });
}