#!/bin/bash
cd `dirname $0`
open -a "/Applications/Safari.app" http://localhost:8000/ & python -m SimpleHTTPServer
