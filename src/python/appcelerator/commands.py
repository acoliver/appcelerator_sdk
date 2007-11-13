
try:
    from pylons.util import PylonsTemplate
    
    class AppceleratorTemplate(PylonsTemplate):
        _template_dir='templates/hello_project'
        summary='Template for an Appcelerator app based on Pylons'
        required_templates=['Pylons#pylons']
        egg_plugins = ['Appcelerator']

except ImportError,e:
    print 'Pylons is required to create an Appcelerator template'
    raise e
    
