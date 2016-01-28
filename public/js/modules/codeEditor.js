ace.require("ace/ext/language_tools");

var editor = {
    createEditor: function(editorID) {
        this.codeEditor = ace.edit(editorID);
        this.codeEditor.setTheme("ace/theme/monokai");
        this.codeEditor.getSession().setMode("ace/mode/csharp");
        this.codeEditor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            enableLiveAutocompletion: false,
            tabSize: 2
        });
    },

    setEditorTheme: function(themeName) {
        this.codeEditor.setTheme("ace/theme/" + themeName);
    },

    setLanguage: function(langName) {
        this.codeEditor.getSession().setMode("ace/mode/" + langName);
    },

    setEditorValue: function(val) {
        this.codeEditor.setValue(val);
    }

};

module.exports = editor;

//TODO: saving code when update page