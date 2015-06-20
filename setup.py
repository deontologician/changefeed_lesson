from setuptools import setup, find_packages

setup(
    name='sample',
    version='0.0.1',
    description='A sample Python project',
    install_requires=[
        "rethinkdb>=2.0.0",
        "flask>=0.0",
    ],
    packages=find_packages(),
)
