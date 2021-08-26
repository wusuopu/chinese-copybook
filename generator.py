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
import sys


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


if __name__ == '__main__':
    ret = generate(sys.argv[1])
    print(ret)
