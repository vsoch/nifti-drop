# Nifti-Drop

Read nifti and nidm files in browser **under development**

 - view header details for nifti
 - interactive coordinate browsing
 - save image to file (export)
 - view nidm results
 - uses [font brain](http://vsoch.github.io/font-brain) for nidm and brain imaging icons

#### Versions

###### Static Local
The base structure of the repo (including [index.html](index.html), [js](js), [css](css), [data](data), and [img](img) work to run a local, static installation. This version works in browsers works in [browsers with FileReader support](http://caniuse.com/#feat=filereader). Depending on the paths in nidm file, however, there can be cross browser issues leading to unreliable loading of some nidm files. To get around this, a python module has been developed for use on a server.

###### Python module
This repo also includes a python module to run nifti-drop from a server, and generate an initial page that has some set of relative files embedded in it. This version will continue to function to drop new images from the user, however it cannot be used to dynamically retrieve different files from the server once the page has been loaded. See an [example][examples/run_local.py] for how to generate this viewer.

To install

      pip install git+git://github.com/vsoch/nifti-drop.git


###### Many Thanks
[Papaya Viewer](https://github.com/rii-mango/Papaya), we salute you!

#### Coming Soon

 - multiple image browsing

[demo](http://vsoch.github.io/nifti-drop)
