({
  afterRender: function(cmp, evt) {
    this.superAfterRender();
    typeof LightningReactComponent !== 'undefined' && LightningReactComponent.render(cmp, evt);
  },

  rerender: function(cmp, evt) {
    this.superRerender();
    typeof LightningReactComponent !== 'undefined' && LightningReactComponent.render(cmp, evt);
  }
})
