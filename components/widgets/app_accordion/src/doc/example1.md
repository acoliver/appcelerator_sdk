Title: Accordion

This is a simple example that uses the `<app:accordion>` to create an accordion layout.

++example
    <div style="width: 250px">
        <app:accordion on="l:accordion then execute" property="rows">
            <html:h2 class="accordion_toggle">#{title}</html:h2>
            <html:div class="accordion_content">#{content}</html:div>
        </app:accordion>
    </div>
    <app:script>
        $MQ('l:accordion', {rows: [{title: 'Test Title 1', content: 'Curabitur quam lorem, laoreet molestie, eleifend id, pulvinar vel, nunc. Proin congue felis quis purus. Aenean porttitor, lacus vel bibendum pulvinar, leo nulla suscipit leo, nec lobortis orci diam eget turpis. Sed eu eros et orci consectetuer molestie. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'}, {title: 'Test Title 2', content: 'Curabitur quam lorem, laoreet molestie, eleifend id, pulvinar vel, nunc. Proin congue felis quis purus. Aenean porttitor, lacus vel bibendum pulvinar, leo nulla suscipit leo, nec lobortis orci diam eget turpis. Sed eu eros et orci consectetuer molestie. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'}, {title: 'Test Title 3', content: 'Curabitur quam lorem, laoreet molestie, eleifend id, pulvinar vel, nunc. Proin congue felis quis purus. Aenean porttitor, lacus vel bibendum pulvinar, leo nulla suscipit leo, nec lobortis orci diam eget turpis. Sed eu eros et orci consectetuer molestie. Lorem ipsum dolor sit amet, consectetuer adipiscing elit.'}]});
    </app:script>
--example

