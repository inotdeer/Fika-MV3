App.module.extend('content', function() {
    //
    let self = this,
        tags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'PRE', 'CODE', 'FIGURE'],
        excludeTags = [
            'BUTTON',
            'IFRAME',
            'CANVAS',
            '#comment',
            'SCRIPT',
            'INPUT',
            'SELECT',
            'ASIDE',
            'HEADER',
            'FOOTER',
            'PERSONALIZATION-PLACEMENT'
        ],
        excludeAttrName = [
            'social',
            'share',
            'twitter',
            'linkedin',
            'pinterest',
            'singleadthumbcontainer',
            'author',
            'reward',
            'reviewer',
            'bb_iawr',
            'bg-food-en-retail',
            'metadata',
            'page-metadata',
            'references',
            'aside',
            'crumb',
            'comment',
            'recommend',
            'video',
            'qrcode',
            'clearfix',
            'thumb',
            'tags',
            'post-header'
        ],
        titleTags = ['H1', 'H2', 'H3'],
        topArticleElement = [],
        articleElementIndex = [],
        articleElements = {},
        articleElementRate = {},
        articleTitle = '',
        pageUrl = '',
        topElement = '',
        topPoint = 0,
        isOpen = false,
		store, photoSrc,
        isAvailable = false;

	this.init = async function() {
        //
        await chrome.runtime.sendMessage({method:'getPhotoSrc'});
        store = await new Promise((resolve)=>{
            chrome.storage.sync.get(null, function (res) {
                resolve(res)
            });
        });
        photoSrc = await new Promise((resolve)=>{
            chrome.runtime.sendMessage({
                'method': 'getPhotoSrc','data':null
            }, function (res) {
                resolve(Array.isArray(res) ? res : [])
            });
        });
        self.findArticlePro();
        chrome.runtime.sendMessage({method:'fetchData'});
        // this.findArticle();

        // console.log(articleElements);
        // console.log(articleElementRate);
        // listen background script send message.
        chrome.runtime.onMessage.addListener(function(request, _, response) {
            let method = request.method;
            if (self.hasOwnProperty(method)) {
                self[method](request.data, response);
            } else {
                self.log('method '+ method +' not exist.');
            }
            response('');
        });
    };

    this.findArticlePro = function() {
        let root = $('body');

        pageUrl = location.href;
        topElement = '';
        topPoint = 0;

        if (root.length === 0) {
            return false;
        }

        //
        let h1 = $('h1');
        if (h1.length === 1) {
            articleTitle = h1.text();
        }

        this.findNextNodePro(root[0]);
        // console.log(topElement, topPoint);
        if (topElement && topElement.innerText.length > 300) {
            isAvailable = true;
            // if is available then execute autopilot
            this.readerMode();
            // this.autopilot();
            this.newBadge();
        } else {
            chrome.runtime.sendMessage({
                'method': 'sendGA',
                'data': {type: 'exception',
                    p:{exDescription: window.location.host}}
            }, function () {});
        }
        //
        this.isReady();
    };

    this.newBadge = function() {
        // if readerMode is ready and user is using a older version, show 'new' badge text
        if (store.version !== Version.currentVersion) {
            chrome.runtime.sendMessage({
                'method': 'new_badge',
                'data': true
            }, function () {
            });
        }
    };

    this.findNextNodePro = function(element) {
        let nodeName = element.nodeName,
            parent = element.parentElement;

        if (nodeName === '#text') {
            let nodeValue = element.nodeValue.replace(/\n|\s|\r/g, '');
            if (nodeValue) {
                let fp = 1;
                if (tags.indexOf(parent.nodeName) !== -1) {
                    fp = 5;
                } else if (parent.nodeName === 'DIV') {
                    fp = 2;
                }
                //
                if (nodeValue.length > 50) {
                    fp = 10;
                }
                if (parent.nodeName === 'P') {
                    fp = nodeValue.length;
                }
                //
                if (!element.parentElement.hasOwnProperty('fp')) {
                    element.parentElement['fp'] = fp;
                } else {
                    element.parentElement['fp'] += fp;
                }
                element.parentElement['fl'] = 2;

            }
        }

        //
        if (element.nodeName === 'ARTICLE' && element.innerText.length > 400) {
            element['fp'] = element.innerText.length;
        }
        //
        // if (nodeName === 'ARTICLE') {
        //     element['fp'] = 1000;
        //     topPoint = element['fp'];
        //     topElement = element;
        //     return true;
        // } else {
            //
        if (excludeTags.indexOf(nodeName) !== -1) {
            return false;
        }
        //
        let childNodesLen = element.childNodes.length;
        if (childNodesLen > 0) {
            for (let i = 0; i < childNodesLen; i++) {
                if (element.childNodes[i]) {
                    if(this.findNextNodePro(element.childNodes[i])) {
                        return true;
                    }
                }
            }
        }
        //
        let fl = element['fl'];
        if (fl > 0 && fl <= 2) {
            element.parentElement['fl'] = (element.parentElement.childNodes.length === 1 || tags.indexOf(nodeName) !== -1) && element.parentElement['fl'] > 0 ? 1 : fl - 1;
        }
        //
        if (element['fp'] && element['fp'] > 0) {
            let point = element.parentElement.childNodes.length === 1 ? element['fp'] : (fl > 0 ? element['fp'] : 1);
            for (var i in excludeAttrName) {
                try {
                    if (element.className && element.className.toLocaleLowerCase().indexOf(excludeAttrName[i]) !== -1) {
                        point -= 100;
                    }
                } catch (e) {
                }
            }
            //
            if (tags.indexOf(element.nodeName) !== -1) {
                // if (element.nodeName === 'ARTICLE' && element.innerText.length > 400) {
                //     element['fp'] += 15000;
                // } else {
                    element['fp'] += 10;
                // }
                point += 10;
            } else if (element.nodeName === 'DIV') {
                element['fp'] += 5;
            } else if (element.nodeName === 'LI') {
                point -= 10;
            }

            this.pointToParentElement(element.parentElement, point);
            if (element['fp'] > topPoint) {
                topPoint = element['fp'];
                topElement = element;
            }
        }
        // }
    };

    this.pointToParentElement = function(parent, point) {
        if (!parent.hasOwnProperty('fp')) {
            parent['fp'] = point;
        } else {
            parent['fp'] += point;
        }
    };

    this.findArticle = function() {
        //
        topArticleElement = [];
        articleElementIndex = [];
        articleElements = {};
        articleElementRate = {};
        articleTitle = '';
        pageUrl = location.href;
        //
        let root = $('body'),
            isAvailable = false;
        if (root.length === 0) {
            return false;
        }
        //
        this.findNextNode(root[0]);
        //
        if (articleElementIndex.length > 0) {
            let topElementRate = {key: '', rate: 0};
            for (let i in articleElementRate) {
                if (articleElementRate.hasOwnProperty(i)) {
                    if (articleElementRate[i] > topElementRate['rate']) {
                        topElementRate = {
                            key: i,
                            rate: articleElementRate[i]
                        }
                    }
                }
            }

            let topElement = articleElements[topElementRate['key']];
            if (topElement.innerText.length > 300) {
                let articleElementIndexLen = articleElementIndex.length;
                //
                for (let i = 0; i < articleElementIndexLen; i++) {
                    if (articleElements.hasOwnProperty(i)) {
                        if (articleElements[i].localName === topElement.localName) {
                            let articleElementClassName = articleElements[i].className;
                            if (articleElementClassName && topElement.className) {
                                if (topElement.className.indexOf(articleElementClassName) === 0 ||
                                    articleElementClassName.indexOf(topElement.className) === 0) {
                                    //
                                    if (topElement.firstElementChild.className !== articleElementClassName &&
                                        articleElements[i].firstElementChild.className !== topElement.className) {

                                        topArticleElement.push(articleElements[i]);
                                    }
                                }
                            } else if (topElement.className === articleElementClassName) {
                                topArticleElement.push(articleElements[i]);
                            }
                        }
                    }
                }
                isAvailable = true;
                console.log(topArticleElement);
            }
        }

        if (isAvailable) {
            this.readerMode();
        }
        //
        chrome.runtime.sendMessage({
            'method': 'reader_ready',
            'data': {
                is_available: isAvailable,
            }
        }, function () {
        });
    };

    this.findNextNode = function(element) {
        if (tags.indexOf(element.nodeName) !== -1) {
            //
            this.rateToParent(element.localName, element.parentElement, 2);
        } else {
            let childrenLen = element.children.length;
            if (childrenLen > 0) {
                for (let i = 0; i < childrenLen; i++) {
                    this.findNextNode(element.children[i]);
                }
            }
        }
    };

    this.rateToParent = function(localName, parent, level) {
        let key = this.findElementIndex(parent),
            levelRate = level;

        if (key === false) {
            articleElementIndex.push(parent);
            key = articleElementIndex.length - 1;
        }

        articleElements[key] = parent;
        if (!articleElementRate.hasOwnProperty(key)) {
            articleElementRate[key] = 0;
        }
        articleElementRate[key] += levelRate;

        let attributes = parent.attributes,
            attributesLen = attributes.length;
        for (let i = 0; i < attributesLen; i++) {
            let nodeValue = attributes[i].nodeValue.toLowerCase();
            if (nodeValue.indexOf('content') !== -1 || nodeValue.indexOf('article') !== -1) {
                articleElementRate[key] += 20;
            }
        }

        if (parent.localName === 'article') {
            articleElementRate[key] += 1.2;
        }

        if (level > 1) {
            this.rateToParent(localName, parent.parentElement, --level);
        }
    };

    this.findElementIndex = function(target) {
        let articleElementIndexLen = articleElementIndex.length;
        for (let i = 0; i < articleElementIndexLen; i++) {
            if (articleElementIndex[i].isEqualNode(target)) {
                return i;
            }
        }

        return false;
    };

    this.isReaderControl = function(element) {
        if (element.nodeType !== 1) return false;
        if (element.closest('figure, figcaption')) return false;
        // Test small UI groups before attributes are stripped. Never classify
        // a whole article or a semantic figure as a subscription control.
        if (element.matches('article, main, body, html, figure, figcaption, pre, code, table')) return false;
        const marker = typeof element.className === 'string' ? element.className + ' ' + element.id : element.id;
        if (/(?:newsletter|related[-_]stories|related[-_]articles)/i.test(marker)) return true;
        if (element.matches('a[href], [role="button"]') && /^\d+$/.test(element.textContent.trim())
            && (element.getAttribute('role') === 'button' || /comment/i.test(element.getAttribute('href') + ' ' + element.getAttribute('aria-label')))) return true;
        if (/(?:google[-_]news|google[-_]follow|preferred[-_]source)/i.test(marker)) return true;
        const text = (element.textContent || '').replace(/\s+/g, ' ').trim();
        if (text.length < 800 && /^Follow topics and authors from this story/i.test(text)
            && !element.querySelector('figure, img, pre, table, p')) return true;
        if (text.length <= 80 && /^\d*\s*comments?(?:\s*\(all new\))?$/i.test(text)
            && !element.querySelector('figure, pre, table, h1, h2, h3, h4')) return true;
        if (text.length <= 100 && /^add us on(?:\s+google(?:\s+news)?)?$/i.test(text)
            && !element.querySelector('figure, figcaption, pre, table, h1, h2, h3, h4, p')) return true;
        if (element.matches('a[href]')) {
            try {
                const url = new URL(element.getAttribute('href'), location.href);
                if (/(^|\.)google\.com$/.test(url.hostname)
                    && /(?:preferences\/source|publications|follow)/i.test(url.pathname)) return true;
            } catch (_) {}
        }
        return false;
    };

    this.filterElement = function(element, articleHtml) {
        if (self.isReaderControl(element)) return false;
        let nodeName = element.nodeName,
            chileNodesLen = element.childNodes.length;

        //
        if (element.attributes) {
            let attributes = element.attributes,
                attributesLen = attributes.length;
            for (let i = 0; i < attributesLen; i++) {
                if (attributes[i].nodeName === 'style' && attributes[i].nodeValue.indexOf('display:none') !== -1) {
                    console.log(attributes[i].nodeValue);
                    return false;
                }
            }
        }

        // title
        if (nodeName === 'H1') {
            return false
        }
        if (titleTags.indexOf(nodeName) !== -1 && !articleTitle) {
            if (element.innerText && element.innerText.length > 0) {
                let pageTitleTarget = $('head title');
                if ((pageTitleTarget.length > 0 &&
                    pageTitleTarget.text().toLocaleLowerCase().indexOf(element.innerText.toLocaleLowerCase()) !== -1) ||
                    (element.className && element.className.toLocaleLowerCase().indexOf('title') !== -1)) {
                    articleTitle = element.innerText;
                    return false;
                }
            }
        }

        if (nodeName === '#text') {
            let nodeValue = element.nodeValue.replace(/\n|\s/g, '');
            if (!nodeValue) {
                return false;
            }
            // Inline author widgets often rely on CSS gaps instead of literal spaces.
            articleHtml.push(/^by\s*$/i.test(element.nodeValue) ? element.nodeValue.trimEnd() + ' ' : element.nodeValue);
            return true;
        } else if (nodeName === 'CODE') {
            articleHtml.push('<code>' + element.textContent.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</code>');
            return true;
        } else if (nodeName === 'PRE') {
            function extract(result, el){
                let c = el.childNodes;
                for (let i of c){
                    if (i.nodeType === 3) result += i.nodeValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                    if (i.nodeType === 1) {
                        if (i.nodeName === 'BR'){
                            result += '\n'
                        } else {
                            result = extract(result, i)
                        }
                    }
                }
                return result
            }
            articleHtml.push('<pre><code>' + extract('', element) + '</code></pre>');
            return true
        } else if (nodeName.toLowerCase() === 'svg') {
            const inFigure = !!element.closest('figure');
            if (element.hidden || element.getAttribute('display') === 'none'
                || getComputedStyle(element).display === 'none') return false;
            // UI icons and hidden sprite sheets are not article illustrations.
            if (!inFigure && (element.getAttribute('aria-hidden') === 'true'
                || element.closest('button, a, [role="button"]'))) return false;
            // Keep static article diagrams, excluding embedded active content.
            const graphic = element.cloneNode(true);
            graphic.querySelectorAll('script,foreignObject,iframe,object,embed,animate,animateMotion,animateTransform,set').forEach(node => node.remove());
            [graphic, ...graphic.querySelectorAll('*')].forEach(node => {
                [...node.attributes].forEach(attr => {
                    if (/^on/i.test(attr.name) || /^(href|xlink:href)$/i.test(attr.name) && !attr.value.startsWith('#')) node.removeAttribute(attr.name);
                });
            });
            // Removing external references can leave a sized but empty SVG.
            // Definitions/symbols alone also render nothing and must not reserve space.
            const paint = [...graphic.querySelectorAll('path,rect,circle,ellipse,line,polyline,polygon,text,image,use')]
                .some(node => {
                    if (node.closest('defs,symbol,clipPath,mask,pattern')) return false;
                    if (node.tagName.toLowerCase() === 'use') {
                        const href = node.getAttribute('href') || node.getAttribute('xlink:href');
                        return href && href.startsWith('#') && [...graphic.querySelectorAll('[id]')].some(target => target.id === href.slice(1));
                    }
                    if (node.tagName.toLowerCase() === 'image') return !!(node.getAttribute('href') || node.getAttribute('xlink:href'));
                    return true;
                });
            if (!paint) return false;
            articleHtml.push(graphic.outerHTML);
            return true;
        } else if (excludeTags.indexOf(nodeName) !== -1) {
            return false;
        } else if (nodeName === 'IMG') {
            let attributes = element.attributes,
                attributesLen = attributes.length,
                src = element.src;

            for (let i = 0; i < attributesLen; i++) {
                if (attributes[i] === 'data-src') {
                    src = attributes[i].nodeValue;
                }
            }
            let htmlString = element.outerHTML.replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, '').replace(/width="(.+?)"/g, '').replace(/height="(.+?)"/g, '');
            // if (element.offsetWidth <= 200) {
            //     htmlString = htmlString.replace(/\s+/, ` style='height:${element.offsetHeight}px;width:${element.offsetWidth}px;'`);
            // }
            articleHtml.push(htmlString);
            return true;
        } else {
            if (nodeName !== 'ARTICLE' && !element.closest('figure, figcaption, .thumb, .thumbcaption')) {
                for (var i in excludeAttrName) {
                    // Author names are article attribution, not clutter.
                    if (excludeAttrName[i] === 'author') continue;
                    try {
                        if ((element.className && element.className.toLocaleLowerCase().indexOf(excludeAttrName[i]) !== -1
                            || element.id && element.id.toLocaleLowerCase().indexOf(excludeAttrName[i]) !== -1)
                            && (element.className.toLocaleLowerCase().indexOf('article') === -1 && element.nodeName !== 'ARTICLE')) {
                            return false;
                        }
                    } catch (e) {
                    }
                }
            }
            //
            try {
                if (element.className.toLocaleLowerCase().indexOf('post') !== -1
                    && element.className.toLocaleLowerCase().indexOf('meta') !== -1) {
                    return false;
                }
                if (element.className.toLocaleLowerCase().indexOf('post') !== -1
                    && element.className.toLocaleLowerCase().indexOf('footer') !== -1) {
                    return false;
                }
                if (nodeName === 'BR') {
                    return 'p';
                }
                if (chileNodesLen === 0 && element.innerText === '') {
                    return false;
                }
            } catch (e) {
            }

            if (nodeName === 'A') {
                articleHtml.push('<' + nodeName + ' href="'+ element.href +'" target="_blank">')
            } else {
                articleHtml.push('<' + nodeName + '>');
            }
            let articleHtmlLen = articleHtml.length;
            for (let i = 0; i < chileNodesLen; i++) {
                let r = this.filterElement(element.childNodes[i], articleHtml);
                if (r === 'p') {
                    let preElement = articleHtml.pop();
                    articleHtml.push('<p>' + preElement + '</p>');
                }
            }
            if (articleHtml.length === articleHtmlLen) {
                articleHtml.pop();
            } else {
                articleHtml.push('</' + nodeName + '>');
            }
        }
    };

    this.prepareReaderSource = function(source) {
        const copy = source.cloneNode(true);
        const originals = source.querySelectorAll('*'), copies = copy.querySelectorAll('*');
        originals.forEach((node, index) => {
            if (node.hidden || getComputedStyle(node).display === 'none') copies[index].setAttribute('style', 'display:none');
        });
        // Keep one readable copy of decorative drop caps.
        for (const visual of copy.querySelectorAll('span[aria-hidden="true"]')) {
            const accessible = visual.nextElementSibling;
            if (accessible && accessible.matches('.sr-only, .screen-reader-text, .visually-hidden')
                && visual.textContent === accessible.textContent) {
                visual.remove(); accessible.removeAttribute('style');
            }
        }
        // Editorial fact boxes are article content, unlike navigation sidebars.
        for (const facts of copy.querySelectorAll('aside[aria-label="Key Facts"]')) {
            const section = document.createElement('section');
            section.innerHTML = facts.innerHTML; facts.replaceWith(section);
        }
        // Remove complete recommendation/sidebar groups before their headings reach the ToC.
        for (const heading of copy.querySelectorAll('h2, h3, h4')) {
            const label = heading.textContent.trim();
            const related = /^Related\s*\/?$/i.test(label);
            if (!related && !/^(Most Popular|The Verge Daily|More in:)/i.test(label)) continue;
            let group = heading.parentElement;
            while (group && group !== copy && !group.matches('article, main, body')) {
                if (group.textContent.length > 5000) break;
                // A related-links box must not swallow adjacent article paragraphs or figures.
                if (related && (group.querySelector('figure, img, svg, pre, table')
                    || [...group.querySelectorAll('p')].some(node => node.textContent.trim().length > 120))) break;
                if (group.querySelector('ol, ul, form') || group.querySelectorAll('a[href]').length >= 2) {
                    group.remove(); break;
                }
                group = group.parentElement;
            }
        }
        // Footer follow widgets may lose their prompt while retaining an author bullet.
        // Target the publisher's footer IDs, keeping bylines, credits and ordinary lists.
        for (const control of copy.querySelectorAll('[id*="follow-author-article_footer"], [id*="follow-topic-article_footer"]')) {
            if (control.closest('figure, figcaption')) continue;
            const item = control.closest('li');
            if (item) {
                const list = item.parentElement;
                item.remove();
                if (list && !list.textContent.trim() && !list.querySelector('img, svg')) list.remove();
            } else control.remove();
        }
        // Restore separation when a linked author name relied on the site's CSS gap.
        for (const name of copy.querySelectorAll('[class*="author"], [id*="author"], [class*="author"] a, [class*="author"] span, a[href*="/authors/"]')) {
            const next = name.nextSibling;
            if (next && next.nodeType === 3 && /^[A-Za-z0-9]/.test(next.nodeValue)
                && /[A-Za-z0-9]$/.test(name.textContent)) next.nodeValue = ' ' + next.nodeValue;
        }
        // Custom feature layouts place attribution and credits outside the scored body.
        const scope = source.closest('main') || source.parentElement;
        const result = document.createElement('div');
        if (scope) {
            for (const note of scope.querySelectorAll('p')) {
                if (note.closest('figure, figcaption, blockquote, aside, pre, table')) continue;
                const text = note.textContent.replace(/\s+/g, ' ').trim();
                if (text.length < 180 && /^(by|photos by)\s+/i.test(text)
                    && note.querySelector('strong, a')) {
                    result.append(note.cloneNode(true));
                    for (const duplicate of copy.querySelectorAll('p')) {
                        if (duplicate.textContent.replace(/\s+/g, ' ').trim() === text) duplicate.remove();
                    }
                }
            }
        }
        result.append(copy);
        if (scope) for (const credits of scope.querySelectorAll('section[aria-label="Credits"]')) {
            if (!source.contains(credits)) result.append(credits.cloneNode(true));
        }
        for (const label of result.querySelectorAll('section[aria-label="Credits"] li span')) {
            // Keep the separator in the label's text; standalone whitespace nodes
            // are discarded by the article filter.
            if (label.textContent.trim().endsWith(':') && label.nextSibling) label.textContent = label.textContent.trimEnd() + '\u00a0';
        }
        return result;
    };

    this.readerMode = function() {
        //
        let articleHtml = [],
            topArticleElementLen = topArticleElement.length,
            text = [];

        //for (let i = 0; i < topArticleElementLen; i++) {
        //    let articleElementList = topArticleElement[i].childNodes,
        //        articleElementListLen = articleElementList.length;

        //    for (let j = 0; j < articleElementListLen; j++) {
        //        this.filterElement(articleElementList[j], articleHtml);
        //    }
        //    text.push(topArticleElement[i].innerText);
        //}

        text = topElement.innerText;
        this.filterElement(this.prepareReaderSource(topElement), articleHtml);
        //
        let title = articleTitle ? articleTitle : $('head title').text();

        // get favicon
        let favicon,
            headLinks = document.getElementsByTagName('link')
        for (let i of headLinks){
            let rel = i.getAttribute('rel')
            if (rel === 'icon' || rel === 'shortcut icon' || rel === 'apple-touch-icon'){
                favicon = i.getAttribute('href');
                break;
            }
        }

        // console.log(articleElement.html());
        $('#fika-reader').remove();
        this.view.append('content', 'layout', {
            title: title,
            content: articleHtml.join(''),
            domain: window.location.hostname,
            favicon: favicon
        }, $('html'));
        this.view.append('content', 'menu', {

        }, $('.fika-menu'));
        //
        this.extFilter();
        this.addVideoLink();
        //
        this.module.reader._init(text, store, photoSrc);
    };

    this.addVideoLink = function() {
        const candidates = document.querySelectorAll('main video, article video, main iframe[src], article iframe[src]');
        const video = [...candidates].find(node => {
            if (node.closest('#fika-reader, [class*="advert"], [id*="advert"], [class*="ad-slot"]')) return false;
            if (node.tagName === 'VIDEO') return !!(node.currentSrc || node.getAttribute('src') || node.querySelector('source[src]') || node.getAttribute('poster'));
            try {
                const url = new URL(node.getAttribute('src'), location.href);
                return /(^|\.)(youtube\.com|youtube-nocookie\.com|vimeo\.com)$/.test(url.hostname);
            } catch (_) { return false; }
        });
        if (!video) return;
        const content = document.querySelector('.fika-content');
        if (!content) return;
        const link = document.createElement('a');
        link.className = 'fika-original-video';
        link.href = location.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Watch video on original page';
        link.addEventListener('click', event => {
            if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            window.open(link.href, '_blank', 'popup=yes,width=1100,height=800,noopener,noreferrer');
        });
        content.prepend(link);
    };

    this.extFilter = function() {
        //
        let parent = $('.fika-content');
        // Responsive headers can repeat around the lead photo. Only deduplicate
        // opening metadata; leave media, captions and body paragraphs untouched.
        const blocks = [...parent[0].querySelectorAll('p, div, section, time')]
            .filter(node => !node.querySelector('p, div, section, time, img, svg, figure, table, pre')
                && !node.closest('figure, figcaption, blockquote, table, pre'));
        const normalized = node => node.textContent.replace(/[\s\uFEFF]+/g, ' ').trim();
        const lead = blocks.find(node => normalized(node).length >= 40);
        const leadText = lead && normalized(lead);
        const seen = new Set();
        for (const node of blocks.slice(0, 30)) {
            const value = normalized(node);
            if (value.length > 450) break;
            const metadata = value === leadText || /^(?:by|photos by)\s+\S/i.test(value)
                || /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\b.*\b20\d{2}\b/.test(value)
                || /^If you buy something from a link,/i.test(value);
            if (!metadata) continue;
            if (seen.has(value)) node.remove(); else seen.add(value);
        }
        // parent.find('noscript').each(function() {
        //     $(this).parent().html($(this).html().replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, ''));
        // });
        //
        parent.find('img').each(function() {
            // if (!$(this).attr('src')) {
                let attributes = $(this)[0].attributes,
                    attributesLen = attributes.length;

                for (let i = 0; i < attributesLen; i++) {
                    if (attributes[i].nodeName.indexOf('data-src') !== -1 ||
                        attributes[i].nodeName.indexOf('datasrc') !== -1 ||
                        attributes[i].nodeName.indexOf('data-original-src') !== -1 ||
                        attributes[i].nodeName.indexOf('data-actualsrc') !== -1) {
                        $(this).attr('src', attributes[i].nodeValue);
                        break;
                    }
                }
            // }
            //
            $(this).removeClass();

            // Ordinary display images do not require the site's CORS mode.
            $(this).removeAttr('crossorigin');
            //
            let img = new Image();
            img.src = $(this).attr('src');
            if (img.width > 200) {
                $(this).css('display', 'block');
                $(this).css('margin', '32px auto');
            }
        });
        //
        parent.find('figure noscript').each(function() {
            let html = $(this).html();
            if (html.indexOf('<img ') !== -1) {
                $(this).parent().html(html.replace(/class="(.+?)"/g, '').replace(/style="(.+?)"/g, ''));
            }
        });
    };

    // 绑定toc翻页
    this.tocScroll = function(){
        const fikaApp = document.getElementById('fika-reader');
        let tocList = [];
        $('.fika-toc a[data-id]').each(function () {
            let id = $(this).attr('data-id'),
                header = document.getElementById(id.slice(1)),
                offsetTop = header.getBoundingClientRect().y;
            tocList.push({
                el: $(this),
                top: offsetTop
            });
            $(this).click(function () {
                fikaApp.scrollTop = offsetTop
                chrome.runtime.sendMessage({
                    'method': 'sendGA',
                    'data': {
                        type: 'event',
                        p: ['toc', 'click']
                    }
                });
            })
        });
        if (tocList.length > 0) {
            tocList[0].el.addClass('fika-toc-active');
            tocList[ Math.floor(tocList.length/2) ].el.addClass('fika-toc-active');
            fikaApp.addEventListener('scroll', function (e) {
                let scrollTop = e.target.scrollTop,
                    activeId = '';
                if (scrollTop <= tocList[0].top){
                    activeId = tocList[0].el.attr('data-id');
                } else {
                    for (let i of tocList) {
                        if ((scrollTop + 48) >= i.top) {
                            activeId = i.el.attr('data-id');
                        }
                    }
                }
                $('.fika-toc a[data-id].fika-toc-active').removeClass('fika-toc-active');
                $(`.fika-toc a[data-id="${activeId}"]`).addClass('fika-toc-active')
            })
        }
    };

    this.highlightCode = function () {
        let fikaApp = document.getElementById('fika-reader');
        fikaApp.querySelectorAll('pre code').forEach((block) => {
            try {
                hljs.highlightBlock(block);
            } catch (err) {
                console.log(err)
            }
        })
    };

    this.autopilot = function () {
    	if (!isOpen){
            let currentDomain = window.location.hostname.split('.').splice(-2).join('.'),
                path =  window.location.pathname;
            if (path !== '/' && store.autopilotWhitelist && store.autopilotWhitelist.indexOf(currentDomain) !== -1){
				this.openReaderMode()
			}
		}
    };

    this.openReaderMode = function() {
        let target = $('#fika-reader');
        if (location.href !== pageUrl) {
            // Restore the source page before rescoring a client-side navigation.
            $('body').show(); $('html, body').css('overflow-y', 'auto');
            target.remove(); target = $('#fika-reader'); isOpen = false;
        }
        if (target.length === 0) {
            this.findArticlePro();
            if (!isAvailable) return false;
            this.readerMode();
            target = $('#fika-reader');
        }
        let display = target.css('display'),
            overflow = 'hidden';

        if (display === 'none') {
            target.show();
            isOpen = true;
            $('body').hide();
            chrome.runtime.sendMessage({
                'method': 'sendGA',
                'data': {
                    type: 'pageview',
                    p: '/on'
                }
            });
            openedTimeStamp = new Date().getTime()
        } else {
            target.hide();
            isOpen = false;
            overflow = 'auto';
            $('body').show();
            // 计算用户使用时间
            if (openedTimeStamp !== 0){
                let duration = new Date().getTime() - openedTimeStamp
                chrome.runtime.sendMessage({
                    'method': 'sendGA',
                    'data': {
                        type: 'timing',
                        p: ['duration', window.location.host, Math.round(duration)]
                    }
                });
            }
        }

        $('html, body').css('overflow-y', overflow);

        // autopilot 时可能document 还没有ready jquery无法获取相应element
        $(document).ready(function() {
            self.tocScroll();
            self.highlightCode();
        });
        chrome.runtime.sendMessage({
            'method': 'is_open',
            'data': isOpen
        }, function () {});
    };
    let openedTimeStamp = 0

    this.closeReaderMode = function() {
        isOpen = false;
        let target = $('#fika-reader');
        $('html, body').css('overflow-y', 'auto');
        $('body').show();
        target.hide();
        //
        chrome.runtime.sendMessage({
            'method': 'is_open',
            'data': false
        }, function () {});
    };

    this.sendFeedback = function(isMatch) {
        chrome.runtime.sendMessage({
            'method': 'feedback',
            'data': {
                is_match: isMatch, // 是否匹配，1是，0否
            }
        }, function () {});
    };

    this.feedbackResponse = function(data) {
        let success = data.success;
    };

    this.loginUser = function(data){
        this.module.reader.login(data);
    };

    this.loginFailed = function (errorType) {
        console.log(errorType)
        this.module.reader.loginFailed(errorType)
    };

    this.checkAvailable = function() {
        if (isAvailable) {
            this.isReady();
        }
    };

    this.isReady = function() {
        chrome.runtime.sendMessage({
            'method': 'reader_ready',
            'data': {is_available: isAvailable,}
        }, function () {});
    };

    this.updatePhotoSrc = function (data) {
        photoSrc = Array.isArray(data) ? data : [];
        if (document.getElementById("fika-reader")) this.module.reader.updatePhotoSrc(photoSrc);
    }
});

