def write_module(path, source):
    module_id = path.stem
    wrapper = (
        '(function (initialize) {\n'
        f'  if (window.VoicesModules) window.VoicesModules.define("{module_id}", initialize);\n'
        "  else if (window.VOICES_MODULE_MODE) throw new Error('Module loader is missing');\n"
        '  else initialize();\n'
        '})(function () {\n'
    )
    path.write_text(wrapper + source.rstrip() + '\n});\n', encoding='utf8')
