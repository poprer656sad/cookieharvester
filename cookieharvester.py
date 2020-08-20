import subprocess, sys, json, time, re, random
from collections import defaultdict

def install_dependencies():
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'lxml'])
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'httpx'])

try:
    import httpx, lxml.html as html
except:
    install_dependencies()
    import httpx, lxml.html as html

class harvester():
    def __init__(self, proxy = None):
        if proxy != None:
            proxies = {
                "https://": 'https://'+proxy
            }
            self.session = httpx.Client(http2=True, proxies=proxies)
        else:
            self.session = httpx.Client(http2=True)
        self.get_abck()
        self.validate_abck()
        self.write_cookies()

    def get_abck(self):
        headers = {
            'authority': 'www.footlocker.com',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'upgrade-insecure-requests': '1',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
            'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            'sec-fetch-site': 'none',
            'sec-fetch-mode': 'navigate',
            'sec-fetch-user': '?1',
            'sec-fetch-dest': 'document',
            'accept-language': 'en-US,en;q=0.9',
        }
        r = self.session.get('https://www.footlocker.com/', headers=headers)
        if 'denied' in r.text.lower():
            print(r.content)
        if r.status_code != 200:
            print('retrying', r.text)
            time.sleep(50)
            self.get_abck()

    def get_sensor(self):
        params = {'abck': self.session.cookies.get('_abck')}
        data = httpx.get('http://127.0.0.1:7000/sensor', params=params).text
        self.sensor_data = data

    def alternate_page(self):
        r = self.session.get('http://127.0.0.1:7000/alternatepage', timeout=30)

    def validate_abck(self, n=0):
        if ('==' not in self.session.cookies.get('_abck')[-30:]):
            return
        self.get_sensor()
        headers = {
            'authority': 'www.footlocker.com',
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.97 Safari/537.36',
            'content-type': 'text/plain;charset=UTF-8',
            'accept': '*/*',
            'origin': 'https://www.footlocker.com',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://www.footlocker.com/',
            'accept-language': 'en-US,en;q=0.9',
        }
        r = self.session.post('https://www.footlocker.com/assets/606f343aui18045c24c7dce0795d42',json={'sensor_data': self.sensor_data}, headers=headers)
        if ('==' in self.session.cookies.get('_abck')):
            if n == 3:
                self.alternate_page()
                n = 0
            time.sleep(1)
            self.validate_abck(n=n + 1)

    def write_cookies(self):
        print('abck:',self.session.cookies.get('_abck'))
        with open('cookies.json','a+') as cookieout:
            cookieout.write(json.dumps({'abck': self.session.cookies.get('abck')})+'\n')

proxy_list = []
try:
    with open('proxies.txt','r+') as proxyfile:
        for line in proxyfile.readlines():
            tp = line.strip()
            print(tp)
            proxy_list.append(tp)
except:
    pass

while True:
    if len(proxy_list) == 0:
        _ = harvester()
    else:
        _ = harvester(proxy=random.choice(proxy_list))
    del _
