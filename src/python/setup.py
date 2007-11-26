from setuptools import setup, find_packages

import os,sys
try:
    version = os.environ['APP_VERSION']
except KeyError:
    raise "Please set the APP_VERSION environment variable"


setup(name='Appcelerator',
      version=version,
      description="Python version of the Appcelerator web application framework for building fast, dynamic, AJAX based web 2.0 applications.",
      long_description="""
      
""",
      classifiers=[
        'Development Status :: 3 - Alpha',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Middleware',
        'Programming Language :: Python',
        'Programming Language :: JavaScript',
        'License :: OSI Approved :: GNU General Public License (GPL)',
        
      ],
      keywords='wsgi web soa ria javascript',
      author='Mark Luffel',
      author_email='mluffel@appcelerator.com',
      url='http://appcelerator.org',
      license='GPL',
      packages=find_packages(exclude=['ez_setup']),
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'beaker>=0.8.1',
          'simplejson',
          'elementtree'
      ],
      entry_points="""
      [paste.app_factory]
      service_broker = appcelerator.core:service_broker_factory
 
      [paste.paster_create_template]
      appcelerator = appcelerator.commands:AppceleratorTemplate
      """
)
