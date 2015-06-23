from setuptools import setup, find_packages

setup(
    name='changefeeds',
    version='0.0.1',
    install_requires=[
        "rethinkdb>=2.0.0",
        "flask>=0.0",
        "gevent==1.0.2",
        "gunicorn==19.3.0",
    ],
    packages=['changefeeds'],
)
