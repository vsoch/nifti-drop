'''
viewer.py: part of the niftidrop package

'''
import os
from niftidrop.templates import get_template, add_string, save_template
from niftidrop.utils import get_random_name, get_extension
from niftidrop.browser import view


"""
generate

will generate a niftidrop viewer to run locally or on a webserver

viewer_input: dictionary with {"nifti.nii.gz":"nidm.ttl"}, with full paths.     
             Paths should be relative to a web_root if view = False, or full paths
             to files on the local system if view=True.
base_image: The base image to use for the viewer. Not specifying a base_image will
            yield a black background. The same standard applies for the path as 
            for image_paths.
view: open a temporary web browser (to run locally). If True, images will be copied
      to a temp folder. If False, image_paths must be relative to web server. File names 
      should be unique. 

"""
def generate(viewer_input,base_image,view_in_browser=False,bootstrap=True,template_choice="index"):

    template = get_template(template_choice)  

    if view_in_browser==True:
        new_viewer_input = generate_temp(viewer_input)
        new_image_paths = new_viewer_input.keys()
        new_nidm_paths = new_viewer_input.values()
        new_base_image = generate_temp({base_image:base_image})
        template = add_string("[SUB_SERVERIMAGES_SUB]",str(new_image_paths),template)
        template = add_string("[SUB_SERVERNIDMS_SUB]",str(new_nidm_paths),template)
        template = add_string("[SUB_BASEIMAGE_SUB]",str(new_base_image.keys()[0]),template)
        new_paths = new_image_paths + new_nidm_paths + new_base_image.keys() 
        real_paths = viewer_input.keys() + viewer_input.values() + [base_image] 
        url_vars = "?file=%s" %(new_viewer_input.values()[0])  
        view(template,real_paths,new_paths,url_vars)

    else:
        if bootstrap:
            template = template.split("\n")
            template = get_bootstrap() + template
            template = "\n".join(template)
        template = add_string("[SUB_SERVERIMAGES_SUB]",str(viewer_input.keys()),template)
        template = add_string("[SUB_SERVERNIDMS_SUB]",str(viewer_input.values()),template)
        template = add_string("[SUB_BASEIMAGE_SUB]",base_image,template)
        return template

def generate_temp(viewer_input):
    # Here we will generate a lookup of temporary files
    new_viewer_input = dict()
    for image_path,nidm_path in viewer_input.iteritems():
        image_ext = get_extension(image_path)
        nidm_ext = get_extension(nidm_path) 
        temp_path = get_random_name()
        temp_nidm_path = "%s.%s" %(temp_path,nidm_ext)
        temp_image_path = "%s.%s" %(temp_path,image_ext)
        new_viewer_input[temp_image_path] = temp_nidm_path
    return new_viewer_input        

def get_bootstrap():
    return ['<script src="https://rawgit.com/vsoch/nifti-drop/master/js/jquery-2.1.4.min.js"></script>','<link rel="stylesheet" type="text/css" href="https://rawgit.com/vsoch/nifti-drop/master/css/bootstrap.min.css">','<script src="https://rawgit.com/vsoch/nifti-drop/master/js/bootstrap.min.js"></script>']
