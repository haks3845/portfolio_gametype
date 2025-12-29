var external;
(function (p) {
    /*
    익스터널로 구동되는 웹뷰 페이지 명령들 입니다
    coypright (c) 2016- 2020 NOD.
    */
    p.interface = null;
    if (location.href == parent.location.href) {
        p.interface = window["KidsBridge"];
        //window["KidsBridge"];
    }
    else {
        window.external = parent.window.external;

        //console.log("external set!", location.href);
    }


})(external = external || {});

