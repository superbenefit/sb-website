// Behaviour of the home page project selector, exactly as the design tool exported it.
// Reference for the logic only (selection, pause, previous, next, auto-advance hand-off).
// It depends on the design tool's runtime and is not meant to be shipped.
class Component extends DCLogic {
renderVals() {
var self = this;
var st = this.state || {};
var sel = typeof st.sel === 'number' ? st.sel : 0;
var paused = !!st.paused;
var data = [{"name": "All In For Sport", "sum": "Applying the Reimagining Power framework to sport organizations: decentralized governance models for equitable, community-driven sport funding.", "place": "", "logo": true, "nologo": false, "initial": "A", "stCls": "status status--active caps", "stLabel": "Active"}, {"name": "DAO Primitives", "sum": "A framework for designing purpose-aligned networks of autonomous teams, covering group phase, scale and state.", "place": "", "logo": true, "nologo": false, "initial": "D", "stCls": "status status--active caps", "stLabel": "Active"}, {"name": "Pacto", "sum": "Summary field at its shortest, about 60 characters long.", "place": "", "logo": false, "nologo": true, "initial": "P", "stCls": "status status--pending caps", "stLabel": "Pending"}, {"name": "Institute for Community Sustainability", "sum": "Summary field at its longest, about 240 characters. This shows how the panel holds a long summary beside a long project name, and that the panel keeps one height while the projects change, so nothing below it on the page moves.", "place": "London, Ontario", "logo": true, "nologo": false, "initial": "I", "stCls": "status status--active caps", "stLabel": "Active"}];
var n = data.length;
function go(i, stop) { return function () { self.setState(stop ? { sel: (i + n) % n, paused: true } : { sel: (i + n) % n }); }; }
return {
selCls: 'sel' + (paused ? ' is-paused' : ''),
playing: !paused, paused: paused, pausedStr: paused ? 'true' : 'false',
count: (sel + 1) + ' / ' + n,
prev: go(sel - 1, true), next: go(sel + 1, true),
toggle: function () { self.setState({ paused: !paused }); },
items: data.map(function (d, i) {
return Object.assign({}, d, { cls: 'sel__name' + (i === sel ? ' is-on' : ''), pcls: 'sel__panel' + (i === sel ? ' is-on' : ''), exp: i === sel ? 'true' : 'false', pick: go(i, true), adv: go(i + 1, false) });
})
};
}
}
