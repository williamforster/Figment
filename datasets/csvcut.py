# csvcut.py -d delim -f fieldslist
# -q: Include quotes in output fields
# in bash run alias="python3 csvcut.py" for convenience

import sys
import argparse
import csv

parser = argparse.ArgumentParser()
parser.add_argument('filename', help='name of a csv file to cut', default=None, nargs="?")
parser.add_argument('-f', action='store', nargs=1, default=None, \
        required=True, metavar='fields', dest='fields', \
        help='A list of fields to output eg. 1,2,3-5,10')
parser.add_argument('-d', action='store', nargs=1, \
        required=False, metavar='delimiter', dest='delimiter', default=",", \
        help='A one character delimiter, default is ,')
parser.add_argument('-q', '--quotes', action='store_true', help='surround output with quotes')
args = parser.parse_args()


# Get fields list and convert ranges to normal
fields = args.fields[0].split(",")
newfields = []
for idx in fields: 
    if "-" in idx:
        idx = idx.split("-")
        if len(idx) is not 2 or not idx[0].isdigit() or not idx[1].isdigit:
            sys.exit("invalid fields argument - range")
        else:
            newfields += range(int(idx[0]), int(idx[1]))
    else:
        if not idx.isdigit():
            sys.exit("invalid fields argument")
        else:
            newfields.append(int(idx))
fields = newfields

# get the csv
file = None
if args.filename is None:
    file = sys.stdin
else:
    try:
        file = open(args.filename, "r")
    except:
        sys.exit("Couldn't open file")
reader = csv.reader(file, delimiter=args.delimiter)

# output the fields
if args.quotes:
    for row in reader:
        print('"' + row[fields[0] - 1] + '"', end='')
        for idx in fields[1:]:
            print(',"' + row[idx - 1] + '"', end="")
        print("")
else:
    for row in reader:
        print(row[fields[0] - 1], end='')
        for idx in fields[1:]:
            print(',' + row[idx - 1], end="")
        print("")
file.close()
