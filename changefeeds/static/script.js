(function(){

    var h = virtualDom.h;
    var diff = virtualDom.diff;
    var patch = virtualDom.patch;
    var createElement = virtualDom.createElement;
    function prettyJSON(json){
        return JSON.stringify(json, undefined, 2)
    }

    function renderLi(new_val){
        return h('div', [
            h('span.score', new String(new_val.score)),
            new_val.name,
            h('button', '+'),
        ])
    )
    function renderList(entries) {

    }

    function createLi(parsed) {
        var li = document.createElement('li')
        li.innerHTML = liContentsTemplate(parsed)
        return li
    }

    function createSSE(outputElement) {
        var sse = new EventSource('/sse_notify')
        sse.onmessage = function(message) {
            console.log('sse.onmessage: ', message)
            var parsed = JSON.parse(message.data)
            outputElement.appendChild(createLi(parsed))
        }
        sse.onerror = function(error) {
            console.log('Error in SSE feed: '+prettyJSON(error))
        }
    }
    document.addEventListener("DOMContentLoaded", function(){
        createSSE(document.getElementById('output'))
    })
})()
