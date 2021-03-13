import requests,sys
from bs4 import BeautifulSoup

def findOnline(dist):
  # dist = "Azamgarh"
  # url = pyperclip.paste()
  if dist == 'test':
    return dist
  else:
    try:
      url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Uttar_Pradesh"
      page = requests.get(url)
      soup = BeautifulSoup(page.content, 'html.parser')
      soup.prettify()
      info=[]
      # print(soup)
      tables = soup.find_all("table")
      # print(tables)
      for table in tables:
        tbody = table.find_all("tbody")
        if len(tbody)==0:
          continue
        tbody=tbody[0]
        # print(tbody)
        for tr in tbody.find_all("tr"):
          # print(tr)
          th = tr.find('th')
          if th is None:
            continue
          a = th.find('a')
          if a is None:
            continue
          if a.get_text() == dist:
            for td in tr.find_all('td'):
              temp = td.get_text().strip()
              temp = temp.replace(',','')
              info.append(temp)
            if(len(info)==4):
              ret = dist +' '+ info[0]+' '+info[1]+' '+info[2]+' '+info[3]
            # print(ret)
            if(len(info)==4):
              return ret
            else:
              return '-1'
    except:
      return '-1'

dist = sys.argv[1]
res = findOnline(dist)
if res is not None:
  print(res)
else:
  print("-1")
  