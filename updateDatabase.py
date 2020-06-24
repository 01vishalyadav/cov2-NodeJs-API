import requests,sys,time
from bs4 import BeautifulSoup

def makeRequest():
  try:
    url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Uttar_Pradesh"
    url1="http://localhost:3333/api/districts/"
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    soup.prettify()
    info=[]
    table = soup.find_all("table",{"class":"citiwise-data"})
    for l in table:
      for ll in l.text.split():
        if not ll.isnumeric():
          info.append(ll)

    del info[0:7]
    del info[len(info)-7:len(info)]
    for d in info:
      p = requests.get(url1+d)
      time.sleep(5)
      print(p.content)

  except:
    print("error")

makeRequest()