'''
browser.py: part of niftidrop package
Functions to visualize in browser

'''
from niftidrop.utils import make_tmp_folder
import SimpleHTTPServer
import SocketServer
import webbrowser
import shutil
import os

'''View code in temporary browser!'''
def view(html_snippet,real_paths=None,new_paths=None,url_vars=None):
    with make_tmp_folder() as tmp_dir:  
        if real_paths:
            if len(real_paths) != len(real_paths):
                print "ERROR: mismatch in length of real and new temp paths."
                return
            for p in range(len(real_paths)):
                # Generate a new file name
                shutil.copy(real_paths[p],"%s/%s" %(tmp_dir,new_paths[p]))
        # Write to temporary file
        tmp_file = "%s/pycompare.html" %(tmp_dir)
        os.chdir(tmp_dir)
        print os.getcwd()
        write_file(html_snippet,tmp_file)
        tmp_file_base = os.path.basename(tmp_file)
        httpd = run_webserver(html_page="%s%s" %(tmp_file_base,url_vars))
        return httpd


'''Internal view function'''
def internal_view(html_snippet,tmp_file):
    url = 'file://%s' %(tmp_file)
    write_file(html_snippet,tmp_file)
    webbrowser.open_new_tab(url)
    raw_input("Press Enter to finish...")

def write_file(html_snippet,tmp_file):
    html_file = open(tmp_file,'wb')
    html_file.writelines(html_snippet)
    html_file.close()

'''Web server (for Papaya Viewer in QA report'''
def run_webserver(PORT=8088,html_page="index.html"):
    Handler = SimpleHTTPServer.SimpleHTTPRequestHandler
    httpd = SocketServer.TCPServer(("", PORT), Handler)
    print "Serving pybraincompare at port", PORT
    webbrowser.open("http://localhost:%s/%s" %(PORT,html_page))
    httpd.serve_forever()
    return httpd

"""Get svg html from matplotlib figures (eg, glass brain images)"""
def get_svg_html(mpl_figures):
    svg_images = []
    with make_tmp_folder() as tmp_dir:  
        for fig in mpl_figures:
            tmp_svg = "%s/mplfig.svg" %(tmp_dir)
            fig.savefig(tmp_svg)
            fig_data = open(tmp_svg,"rb").readlines()
            svg_images.append(fig_data)
    return svg_images
