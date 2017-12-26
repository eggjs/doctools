'use strict';

const renderer = require('../lib/renderer');

/* global hexo */
hexo.extend.renderer.register('md', 'html', renderer, true);

hexo.extend.helper.register('guide_toc', function() {
  const toc = this.site.data.guide_toc;
  let menu = '<dl>';
  for (let title in toc) {
    const originTitle = title; // use title as a part of id。
    const subMenu = toc[title];
    title = getI18nText(this.__, title, 'guide_toc.');
    menu += `<dt id="title-${originTitle}" style="cursor: pointer;" class="aside-title">${title}<a id="collapse-icon-${originTitle}" class="icon opend"></a></dt><dd id=panel-${originTitle}><ul>`;
    for (let subTitle in subMenu) {
      const url = '/' + this.page.lang + subMenu[subTitle];
      subTitle = getI18nText(this.__, subTitle, 'guide_toc.');
      menu += `<li><a href="${url}" class="menu-link">${subTitle}</a></li>`;
    }
    menu += '</ul></dd>';
  }
  menu += '</dl>';
  return menu;
});

hexo.extend.helper.register('menu_link', function() {
  const menus = this.site.data.menu;

  let links = '';
  for (const menu in menus) {
    let link = menus[menu];
    const content = getI18nText(this.__, menu, 'menu.');

    // http://example.com -> http://example.com
    // /api -> /api
    // intro/ -> /zh-cn/intro/
    if (!/^http/.test(link) && !/^\//.test(link)) {
      link = '/' + this.page.lang + '/' + link;
    }
    links += `<li><a href="${link}" alt="${content}">${content}</a></li>`;
  }

  return links;
});

hexo.extend.helper.register('index_link', function(url) {
  if (!url) {
    url = '/';
  }
  return `/${this.page.lang}${url}`;
});

function getI18nText(gettext, text, prefix) {
  const key = prefix + text;
  const tmp = gettext(key);
  return tmp === key ? text : tmp;
}

hexo.extend.helper.register('language_list', function() {
  let languageList = '';

  const lanRef = {
    'zh-cn': '中文',
    'en': 'English'
  }

  const language = this.config.language;
  if (language) {
    languageList += '<span class="arrow"></span>';
    languageList += '<ul id="dropdownContent" class="dropdown-content">';
    language.forEach(item => {
      if (lanRef[item]) {
        const highlight = this.page.lang === item ? 'style="color: #22ab28"' : '';
        languageList += `<li><a id="${item}" href="/${item}/${this.page.canonical_path}" ${highlight}>${lanRef[item]}</a></li>`;
      }
    });
    languageList += '</ul>';
  }
  
  return languageList;
});