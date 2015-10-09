from setuptools import setup, find_packages

setup(
    # Application name:
    name="niftidrop",

    # Version number (initial):
    version="0.0.1",

    # Application author details:
    author="Vanessa Sochat",
    author_email="vsochat@stanford.edu",

    # Packages
    packages=find_packages(),

    # Data
    package_data = {'niftidrop/template':['*.html','*.zip','*.js','*.css']},

    # Details
    url="http://www.github.com/vsoch/nifti-drop",

    license="LICENSE.txt",
    description="drag and drop python viewer for nifti and nidm files",

    install_requires = ['nibabel']
)
