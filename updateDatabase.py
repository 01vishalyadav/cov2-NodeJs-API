# import requests,sys,time
# from bs4 import BeautifulSoup

# def makeRequest():
#   try:
#     url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Uttar_Pradesh"
#     url1="http://localhost:3333/api/districts/"
#     page = requests.get(url)
#     soup = BeautifulSoup(page.content, 'html.parser')
#     soup.prettify()
#     tables = soup.find_all("table",{"class":"citiwise-data"})
#     tableBody = tables[0].tbody
#     ths = tableBody.find_all("th")
#     districts = []
#     for th in ths:
#       thContentList = th.get_text().split("\n")
#       for thContent in thContentList:
#         if not thContent.isnumeric():
#           if len(thContent)>1:
#             districts.append(thContent)
#     del districts[0:5]
#     districts.pop()

#     for d in districts:
#       print(d)
#       print(url1+d)
#       p = requests.get(url1+d)
#       print(p.content)
#       time.sleep(5)

#   except:
#     print("error")

# makeRequest()

import requests,sys,time
from bs4 import BeautifulSoup

def getAllDistrictsName():
  districts=[]
  try:
    url = "https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Uttar_Pradesh"
    page = requests.get(url)
    soup = BeautifulSoup(page.content, 'html.parser')
    soup.prettify()
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
        district=a.get_text().strip()
        # print(district)
        districts.append(district)
        if(district=="Varanasi"):
          # first 5 elements in districts are not district,i.e, remove them
          del districts[0:5]
          # print(districts)
          return districts
  except:
    return districts


getAllDistrictsName()
districts = getAllDistrictsName()
if len(districts) == 0:
  print("counld not find names, some error occured")
else:
  url1="http://localhost:3333/api/districts/"
  # make requests by using names in districts to update database
  for d in districts:
    print ("making request for", end=":")
    print(url1+d)
    p = requests.get(url1+d)
    print("got response: ",end="")
    print(p.content)
    time.sleep(3)

  