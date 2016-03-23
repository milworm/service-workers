#!/usr/bin/env python

import os.path as path

dir = path.dirname(path.abspath(__file__))
build_file_path = dir + '/BUILDNO'
build_search_str = '<buildno></buildno>'

if path.isfile(build_file_path):
    version = open(build_file_path, 'r').readline().strip()
    version = int(version) + 1
else:
    version = 1

version = str(version)
open(build_file_path, 'w').write(version)

# update js/css/html files.
# main_js_file = open(dir + '/js/app.js')
# main_css_file = open(dir + '/js/app.css')

html_files = [
    '/manifest.appcache',
    '/index.html', 
    '/index.sw.html'
]

for name in html_files:
    content = open(dir + name).read()
    content = content.replace(build_search_str, version)
    open(dir + name, 'w').write(content)
    
