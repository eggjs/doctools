<div class="page-main">
  <article class="markdown-body">
    <h1>内置插件列表</h1>
    <ul>
    {% for plugin in site.data.plugins %}
      <li>
        <a href="./{{plugin}}.html">{{plugin}}</a>
      </li>
    {% endfor %}
    </ul>
  </article>
  {{ partial('partial/aside') }}
</div>
