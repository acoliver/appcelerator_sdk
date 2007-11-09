from setuptools import setup, find_packages

# we're going to keep the version number in sync with the main appcelerator version,
# even though it's somewhat silly to release a new port at version 2
version = '2.0'

setup(name='Appcelerator',
      version=version,
      description="Python version of the Appcelerator web application framework for building fast, dynamic, AJAX based web 2.0 applications.",
      long_description="""
      
""",
      classifiers=[
        'Development Status :: 3 - Alpha'
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'Topic :: Internet :: WWW/HTTP :: WSGI :: Middleware'
        'Programming Language :: Python',
        'License :: OSI Approved :: GNU General Public License (GPL)',
        
      ],
      keywords='wsgi web middleware soa ria',
      author='Mark Luffel',
      author_email='mluffel@appcelerator.com',
      url='http://appcelerator.org',
      license='GPL',
      packages=find_packages(exclude=['ez_setup', 'tests']),
      install_requires=[
          'beaker',
          'simplejson',
          'elementtree'
      ],
      entry_points="""
      [paste.app_factory]
      service_broker = appcelerator.core:service_broker_factory
      """
)
