Title: Using the Tabpanel to control things

This example shows how you can use the `<app:tabpanel>` to flip between divs

++example
<app:tabpanel id="tabpanel6" initial="tab2">
    <tab name="tab1">Tab 1</tab>
    <tab name="tab2">Tab 2</tab>
    <tab name="tab3">Tab 3</tab>
</app:tabpanel>
<div on="tabpanel6[tab1] then show else hide" style="color: red">You've selected tab 1</div>
<div on="tabpanel6[tab2] then show else hide" style="color: green">You've selected tab 2</div>
<div on="tabpanel6[tab3] then show else hide" style="color: blue">You've selected tab 3</div>
--example
