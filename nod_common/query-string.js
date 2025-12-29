queryString = new (function () {
    var p = this;
    var objString = {};
    var query = window.location.search.substring(1);

    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        // If first entry with this name
        if (typeof objString[pair[0]] === "undefined") {
            objString[pair[0]] = pair[1];
            // If second entry with this name
        } else if (typeof objString[pair[0]] === "string") {
            var arr = [objString[pair[0]], pair[1]];
            objString[pair[0]] = arr;
            // If third or later entry with this name
        } else {
            objString[pair[0]].push(pair[1]);
        }
    }

    p.get = function (key) {
        //console.log("get", objString, key)
        return objString[key];
    }
    p.set = function (key, str) {
        return objString[key] = str;
    }

})();
