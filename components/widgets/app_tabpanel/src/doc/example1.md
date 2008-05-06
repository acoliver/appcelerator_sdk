Title: Simple Example

This is a simple example that uses the `<app:tabpanel>`.
  
  <style>
  <!--
  #styled .tabpanel a:hover
  {
    background-color:#3B5998;
    color:#fff;
    font-weight:bold;
    opacity:0.99;
  }
  #styled .tab_inactive
  {
    border-bottom:none; 
    background-color:#fff;
    color:#111;
    font-weight:bold;
    opacity:0.4;
  }
  #styled .tab_active
  {
    border-bottom:2px solid #3B5998; 
    background-color:#3B5998;
    color:#fff;
    font-weight:bold;
    opacity:0.99;
  }
  #my_tab_divider
  {
    border:1px solid #999;
    border-top:none;
    padding-bottom:5px;
    height:3px;
    background-color:#3B5998;
  }
  -->
  </style>

Here's an example of a basic tab panel with no custom styling
  <div id="styled">
    <app:tabpanel id="contentmenu" initial="tab1">
      <tab name="tab1">Tab 1</tab>
      <tab name="tab2">Tab 2</tab>
      <tab name="tab3">Tab 3</tab>
    </app:tabpanel>
  </div>

Here's an example of a basic tab panel with custom styling
  <div id="styled">
    <app:tabpanel id="styled_tab" initial="tab1">
      <tab name="tab1">Look</tab>
      <tab name="tab2">at Me</tab>
      <tab name="tab3">I'm so pretty</tab>
    </app:tabpanel>
    <div id="my_tab_divider"></div>  
  </div>
