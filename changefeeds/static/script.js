(function(){
    "use strict"
    var ChangefeedView = Backbone.View.extend({
        initialize: function(options){
            this.url = options.url
            this.collection = new Backbone.Collection([])
            this.collection.comparator = options.compare_field
            this.template = options.template
            this.title = options.title
            this.sse = this.createSSE()
        },
        render: function() {
            console.log('rendering')
            this.$el.html(this.template(this.collection))
            return this
        },
        createSSE: function() {
            var sse = new EventSource(this.url)
            var that = this
            sse.onmessage = function(change) {
                var parsed_change = JSON.parse(change.data)
                console.log(parsed_change)
                that.createUpdateDelete(parsed_change)
            }
            sse.onerror = function(error) {
                console.error('Error for feed on '+that.url)
            }
            return sse
        },
        createUpdateDelete: function(change){
            if(!!change.new_val && !!change.old_val){
                this.onupdate(change.new_val, change.old_val)
            }else if(!!change.new_val) {
                this.oncreate(change.new_val)
            }else if(!!change.old_val) {
                this.ondelete(change.old_val)
            }
        },
        onupdate: function(newval, oldval){
            console.log('changed an element')
            this.collection.remove(oldval)
            this.collection.add(newval, {merge: true})
            this.render()
        },
        oncreate: function(value){
            console.log('created')
            this.collection.add(value, {merge: true})
            this.render()
        },
        ondelete: function(value){
            console.log('deleted')
            this.collection.remove(value.id)
            this.render()
        },
        remove: function(){
            this.stopListening()
            this.sse.close()
        }
    })

    $(function(){
        // Example view. create as many of these as you'd like
        var top20View = new ChangefeedView({
            className: 'container',
            title: 'Top Twenty Scores',
            url: '/top_twenty',
            comparator: 'score',
            template: function(collection) {
                var elems = collection.toJSON().map(function(character){
                    return '<li><div><span class="score">'+
                        character.score+'</span>'+
                        character.name +
                        '<span class="species">'+character.species.join('/')+'</span>'+
                        '</div></li>';
                }).join('')
                var ol = '<ol id="output">'+elems+'</ol>'
                return '<div class="container"><h1>'+this.title+'</h1>'+ol+'</div>'
            }
        })
        console.log(top20View.el)
        $('body').append(top20View.$el)
    })
})()
