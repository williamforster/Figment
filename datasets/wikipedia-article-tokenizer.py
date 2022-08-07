# python wikipedia-article-tokenizer.py [--count|--javascript] [--limit processLines] filename
#
# The wikipedia dump index file is formatted:
#
# StartByteOffset:EndByteOffset:Article
#
# eg.
# 1123:1161:An article title
# 1162:1291:The next article title
#
# This program ignores the byte offsets, and gets the number of occurences
# of each token in the article titles. Then prints tokens in order of
# most common to least common
#
#

import sys
import argparse
import re

#\s = whitespace characters
#| = or
#\W = non-alphanumeric characters
#delimiters = '\W'
delimiters = '[^a-zA-Z0-9]'

# parse the program arguments
parser = argparse.ArgumentParser()
parser.add_argument('filename', help='name of a file', default=None, nargs="?")
parser.add_argument('-c', '--count', action='store_true', help='include occurence count in output (after tab)')
parser.add_argument('-j', '--javascript', action='store_true', help='output as a javascript variable')
parser.add_argument('-l', '--limit', action='store', \
        required=False, dest='limit', type=int, default=0, \
        help='Limit processing of file to X lines')
args = parser.parse_args()

# open file
file = None
if args.filename is None:
    file = sys.stdin
else:
    try:
        file = open(args.filename, "r", encoding="utf8")
    except:
        sys.exit("Couldn't open file")

# temporary limiter for long files
iteration = 0
# the tokens
allTokens = {}

# fill the dictionary with tokens
for line in file:
    iteration += 1

    # strip the byte offsets from line
    firstColonOccurence = line.find(':')
    if firstColonOccurence < 0:
        sys.stderr.write("Malformed line (" + str(iteration) + "):" + line)
        continue
    strippedFirstByteOffset = line[firstColonOccurence + 1:]
    secondColonOccurence = strippedFirstByteOffset.find(":")
    if secondColonOccurence < 0:
        sys.stderr.write("Malformed line (" + str(iteration) + "):" + line)
        continue
    strippedByteOffsets = strippedFirstByteOffset[secondColonOccurence + 1:]

    # tokenize the line and increment the dictionary
    lineTokens = re.split(delimiters, strippedByteOffsets)
    for token in lineTokens:
        if token == '':
            continue
        try:
            count = allTokens[token]
            allTokens[token] = count + 1
        except KeyError:
            allTokens[token] = 1
    if args.limit > 0 and iteration >= args.limit:
        break

file.close()

#sort by occurence count descending
sortedDict = sorted(allTokens, key=allTokens.get, reverse=True)
# print the output
utf8stdout = open(1, 'w', encoding='utf-8', closefd=False) # fd 1 is stdout
if args.javascript:
    print("const WIKIPEDIA_TOKENS = [", flush=True)
    for key in sortedDict:
        print('"' + key +'",', file=utf8stdout, flush=True)
    print("]", flush=True)
else:
    for key in sortedDict:
        if args.count:
            print(key + "\t" + str(allTokens[key]), file=utf8stdout)
        else:
            print(key, file=utf8stdout)
