const APIURL = "/api/"
window.onload = function () {
    const sideBar = new Vue({
        el: '#left-panel', data: { selectedBoard: null, boards: [{ id: 1, name: "闂茶亰", intro: "璇锋湡寰呯牬宀涚殑瀹屽叏浣擄紝涓嶈繃鐪熺殑鏈変汉鏈熷緟涔堚€︹€?,},{id:4,name:"缁煎悎鐗?",intro:"涓轰粈涔堟槸4鍛 ?, }, { id: 12, name: "婕旓紙宸ㄩ瓟锛?,intro:"杩欓噷鍙互婕斿法榄旓紝鎵€浠ュ叾浠栨澘鍧楀氨涓嶈浜?, }, { id: 23, name: "鎵撴崬", intro: "鐢ㄦ潵杞创鎴栬€呬粈涔堢殑锛屽彂鐐规湁瓒ｇ殑涓滆タ鍚?,},{id:34,name:"鍔ㄧ敾婕敾"},{id:35,name:"NSFW",intro:"Not Safe for Work"},{id:45,name:"璐村浘"},{id:46,name:"璐村浘(R18)",intro:"鍚湁闇查鐨勬弿鍐欒鎱庨噸娓歌",},{id:47,name:"闅忕紭",intro:"鏀剧疆甯屾湜缈昏瘧鐨勬暎鍥 ?, }, { id: 48, name: "闅忕紭(R18)", intro: "鏀剧疆甯屾湜缈昏瘧鐨勬暎鍥?鍚湁闇查鐨勬弿鍐欒鎱庨噸娓歌", }, { id: 99, name: "闂ㄦ埧" }, { id: 100, name: "/int/", }, { id: 101, name: "鏃ヨ", intro: "璁板緱澶囦唤", }, { id: 102, name: "闀垮锛堜弗鑲冿級", intro: "涓囧彜濡傞暱澶?娉ㄦ剰澶囦唤)", },] }, methods: {
            viewBoard(board) {
                this.selectedBoard = board.id; console.info(this.selectedBoard)
                threadPanel.bPage = 0; threadPanel.bid = board.id; threadPanel.tid = 0; postPanel.bid = board.id; postPanel.tid = 0; postPanel.infotitle = board.name; postPanel.infotxt = board.intro; fetch(APIURL, { method: "POST", mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded', }, body: JSON.stringify({ m: "dir", tid: 0, bid: board.id, page: 0, }) }).then(response => response.json()).then(data => {
                    threadPanel.threads = data; threadPanel.lengthOfLastPage = 15; postPanel.showPostContiner = true; url = new URL(window.location); url.search = ""
                    url.searchParams.set('bid', board.id); window.history.pushState({}, '', url);
                });
            },
        }
    }); const threadPanel = new Vue({
        el: '#thread-panel', created() { }, data: { bid: 0, tid: 0, threadsOfBoard: [], threads: [], bPage: 0, tPage: 0, lengthOfLastPage: -1, pList: ["i.pximg.net", "pbs.twimg.com", "sinaimg.cn", "chkaja.com", "inari.site", "hana-sweet.top", "p.sda1.dev",], }, mounted() {
            var str = ""
            for (var i = 0; i < this.pList.length; i++) {
                str += "|"
                str += this.pList[i]
            }
            regex = new RegExp("^https://(\\w[\\w\\.]*\\.)?(" + str.substr(1) + ")/.*$"); this.directView()
            window.directViewThreadPanel = this.directView
        }, methods: {
            directView() {
                var url = new URL(window.location); if (url.searchParams.get("bid") == null) {
                    this.bid = 0
                    this.lengthOfLastPage = -1
                    this.threads = []
                    this.tid = 0
                    return;
                } else { this.bid = parseInt(url.searchParams.get("bid"), 10) }
                if (url.searchParams.get("tid") == null) { this.tid = 0 } else { this.tid = parseInt(url.searchParams.get("tid"), 10) }
                if (url.searchParams.get("page") == null) { this.tPage = 0 } else { this.tPage = parseInt(url.searchParams.get("page"), 10) }; fetch(APIURL, { method: "POST", mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded', }, body: JSON.stringify({ m: "dir", tid: this.tid, bid: this.bid, page: this.tPage, }) }).then(response => response.json()).then(data => { this.threads = data; this.lengthOfLastPage = 15; postPanel.showPostContiner = true; });
            }, nextPage() { this.bPage = this.bPage + 1; fetch(APIURL, { method: "POST", mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded', }, body: JSON.stringify({ m: "dir", tid: 0, bid: this.bid, page: this.bPage, }) }).then(response => response.json()).then(data => { this.lengthOfLastPage = data.length; this.threads = this.threads.concat(data); }); }, viewThread(threadObj, page, replyID) {
                if (this.bid == 0) { return }
                if (replyID == 0) { } else { }
                this.tid = threadObj.no; postPanel.tid = threadObj.no; fetch(APIURL, { method: "POST", mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded', }, body: JSON.stringify({ m: "dir", tid: this.tid, bid: this.bid, page: page, }) }).then(response => response.json()).then(data => {
                    this.threads = data; this.tPage = page; url = new URL(window.location); if (this.tid > 0) { url.searchParams.set('tid', this.tid); }
                    url.searchParams.set('page', this.tPage); window.history.pushState({}, '', url);
                });
            }, viewBoard(board) {
                this.bid = board.id; console.info(this.bid)
                fetch(APIURL, { method: "POST", mode: 'cors', headers: { 'Content-Type': 'application/x-www-form-urlencoded', }, body: JSON.stringify({ m: "dir", tid: 0, bid: board.id, page: 0, }) }).then(response => response.json()).then(data => {
                    this.threads = data; this.bPage = 0; this.bid = board.id; postPanel.bid = board.id; this.lengthOfLastPage = 15; postPanel.showPostContiner = true; url = new URL(window.location); url.search = ""
                    url.searchParams.set('bid', board.id); window.history.pushState({}, '', url);
                });
            },
        }, filters: {
            dateFilter: function (time) {
                if (!time) { return '' } else {
                    const date = new Date(time * 1000)
                    const dateNumFun = (num) => num < 10 ? `0${num}` : num
                    const [Y, M, D, h, m, s] = [date.getFullYear(), dateNumFun(date.getMonth() + 1), dateNumFun(date.getDate()), dateNumFun(date.getHours()), dateNumFun(date.getMinutes()), dateNumFun(date.getSeconds())]
                    return `${Y}-${M}-${D} ${h}:${m}:${s}`
                }
            }, picChecker: function (h) {
                if (h == "") return ""; if (!regex.test(h)) { }
                h = h.replace("i.pximg.net", "pximg.moonchan.xyz")
                h = h.replace("pbs.twimg.com", "twimg.moonchan.xyz")
                return h
            }, redirect: function (h) {
                console.log(h)
                h = h.replace("i.pximg.net", "pximg.moonchan.xyz")
                h = h.replace("pbs.twimg.com", "twimg.moonchan.xyz")
                return h
            }, txtFilter: function (t) {
                t = t.replaceAll("\n", "<br>")
                return t
            }
        }
    }); const postPanel = new Vue({
        el: '#poster-continer', data: { showPostContiner: false, isDisabled: false, infotitle: " ", infotxt: " ", title: "", name: "", pic: "", id: "", auth: "", txt: "", bid: 0, tid: 0, tPage: 0, bPage: 0, }, mounted() {
            this.directView()
            window.directViewPostPanel = this.directView
        }, methods: {
            directView() {
                this.infotitle = ""
                this.infotxt = ""
                var url = new URL(window.location); if (url.searchParams.get("bid") == null) {
                    this.showPostContiner = false
                    this.bid = 0
                    return
                } else { this.bid = parseInt(url.searchParams.get("bid"), 10) }
                if (url.searchParams.get("tid") == null) {
                    this.tid = 0
                    return
                } else { this.tid = parseInt(url.searchParams.get("tid"), 10) }
            }, postThread() {
                this.isDisabled = true; if (this.txt == "" && this.pic == "") { this.isDisabled = false; return; }
                var page = 0
                if (threadPanel.tid > 0) {
                    page = threadPanel.tPage
                    threadPanel.threads[0].list = [];
                } else { threadPanel.threads = []; }
                var data = { m: "post", tid: this.tid, bid: this.bid, n: this.name, t: this.title, id: this.id, auth: this.auth, txt: this.txt, p: this.pic, page: page, }
                fetch("/api/", { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded', }, body: JSON.stringify(data) }).then(response => response.json()).then(data => {
                    threadPanel.threads = data; threadPanel.lengthOfLastPage = 15; console.log("postThreadFlushBoard"); console.log(this.bid); console.log(this.bPage); console.log(this.threads); console.log(this.lengthOfLastPage); this.isDisabled = false; console.log(data.length)
                    if (data.length > 0) {
                        this.txt = ""
                        this.pic = ""
                    }
                });
            }
        }
    })
    const headerPanel = new Vue({
        el: '#header-panel', data: { id: "", auth: "", isAbled: true }, mounted() {
            if (localStorage.auth == "" || localStorage.auth == null) { this.getID() }
            if (localStorage.id && localStorage.auth) { this.id = localStorage.id; this.auth = localStorage.auth; postPanel.id = localStorage.id; postPanel.auth = localStorage.auth; }
        }, methods: {
            delID() { localStorage.id = ""; localStorage.auth = ""; this.id = localStorage.id; this.auth = localStorage.auth; postPanel.id = localStorage.id; postPanel.auth = localStorage.auth; }, getID() {
                this.isAbled = false
                fetch(APIURL + "cookie").then(response => response.json()).then(data => {
                    this.id = data.id
                    this.auth = data.auth
                    localStorage.id = data.id
                    localStorage.auth = data.auth
                    postPanel.id = localStorage.id; postPanel.auth = localStorage.auth; this.isAbled = true
                });
            }
        },
    })
}
