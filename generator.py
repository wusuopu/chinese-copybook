#!/usr/bin/env python
# encoding: utf-8

try:
    from http.client import HTTPConnection
except Exception:
    from httplib import HTTPConnection
try:
    from urllib.parse import urlencode
except Exception:
    from urllib import urlencode
import json
import os
import sys


def down_file(url, output):
    if os.path.exists(output) and os.stat(output).st_size > 0:
        return True

    conn = HTTPConnection("www.maogang.com")
    headers = {
      'Connection': 'keep-alive',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'http://www.maogang.com',
      'Referer': 'http://www.maogang.com/details6',
      'Accept-Language': 'zh,en;q=0.9,en-US;q=0.8,zh-CN;q=0.7,zh-TW;q=0.6',
    }
    conn.request("GET", url, '', headers)
    res = conn.getresponse()
    if res.status != 200:
        return False

    data = res.read()
    ret = data.decode("utf-8")
    conn.close()
    with open(output, 'w') as fp:
        fp.write(ret)
    return True


def down_svg(code):
    # http://www.maogang.com/fonts-Svg/QFKT/u971c.svg       手写楷体
    # http://www.maogang.com/fonts-Svg/TYZxingshu/u971c.svg 华章行书
    # http://www.maogang.com/fonts-Svg/FZKTJW/u971c.svg     楷体
    print(u'download svg for %s' % (code))
    svg_file = '%s.svg' % (code)
    down_file('/fonts-Svg/QFKT/u%s.svg' % (code), 'static/fonts-svg/qfkt/%s' % (svg_file))
    down_file('/fonts-Svg/TYZxingshu/u%s.svg' % (code), 'static/fonts-svg/xingshu/%s' % (svg_file))
    down_file('/fonts-Svg/FZKTJW/u%s.svg' % (code), 'static/fonts-svg/FZKTJW/%s' % (svg_file))


def generate(text):
    conn = HTTPConnection("www.maogang.com")
    payload = urlencode({'content': text})
    headers = {
      'Connection': 'keep-alive',
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'X-Requested-With': 'XMLHttpRequest',
      'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'http://www.maogang.com',
      'Referer': 'http://www.maogang.com/details8',
      'Accept-Language': 'zh,en;q=0.9,en-US;q=0.8,zh-CN;q=0.7,zh-TW;q=0.6',
    }
    conn.request("POST", "/Layout/CopybookType1", payload, headers, )
    res = conn.getresponse()
    data = res.read()
    ret = data.decode("utf-8")
    conn.close()
    return ret


def gen_all_text():
    with open('txt', 'rb') as fp:
        text = fp.read().strip().decode('utf8')
    for t in text:
        code = json.dumps(t)[3:-1]
        outfile = 'static/data/%s.json' % (code)
        if os.path.exists(outfile):
            continue

        print(u'generating for %s %s' % (t, code))
        ret = json.loads(generate(t.encode('utf8')))
        lattice = ret['Info']['Lattice']
        if not lattice:
            # 该汉字不存在
            continue

        data = {
            'steps': [],
        }
        for item in lattice:
            if item['IsLine'] or not item['Strokes']:
                continue
            if item['Highlight']:
                data['steps'].append(item['Strokes'])
            data['stroke'] = item['Strokes']
        with open(outfile, 'w') as fp:
            json.dump(data, fp)


def merge_json():
    src_dir = 'static/data'
    dest_dir = 'static/'

    data = {}

    files = os.listdir(src_dir)
    for f in files:
        if not f.endswith('.json'):
            continue
        code = f[0:4]
        with open(os.path.join(src_dir, f), 'r') as fp:
            item = json.load(fp)
        data[code] = item['stroke']

    with open(os.path.join(dest_dir, 'data.js'), 'w') as fp:
        fp.write(';var ALL_DATA=')
        fp.write(json.dumps(data))
        fp.write(';')


if __name__ == '__main__':
    if (len(sys.argv) > 1):
        ret = generate(sys.argv[1])
        print(ret)
    else:
        # merge_json()
        with open('static/data.json', 'r') as fp:
            data = json.load(fp)
        for code in data:
            down_svg(code)
