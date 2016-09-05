# https://doofenshmirtzevilincorporated.blogspot.tw/2015/06/wireshark.html
# http://v.im.cyut.edu.tw/~doofenshmirtz/timing4.php.txt

cd data 

# 刪除舊資料
# rm *

# 重新下載總表
# wget -N -O all-routes.txt 'http://117.56.85.168/iTravel/RealRoute/aspx/RealRoute.ashx?Type=GetSelect&Lang=Cht'
#perl -pe 's#\|#\n#g; s#_##g' all-routes.txt | perl -F, -nale 'print "$F[0],[$F[2]] $F[3]" if ($F[0]<1000 && $F[3]=~/-/)' | sort -n | uniq -w 3 > all-routes.csv

# 重新下載所有路線的 (1) 站牌資訊 (2) 行車路線
#for i in $(perl -pe 's/,.*//' all-routes.csv) ; do wget "http://citybus.taichung.gov.tw/tcbus2/GetStopEx.php?useXno=1&json=1&routeIds=$i" -O  stops-$i.json ; sleep 30 ; done
#for i in $(perl -pe 's/,.*//' all-routes.csv) ; do wget "http://citybus.taichung.gov.tw/tcbus2/GetRoutePtsEx.php?noEncode=1&useXno=1&json=1&routeIds=$i" -O  route-$i.json ; sleep 30 ; done

# 從官網的 *.json 檔產生程式要看的 *.geojson 檔
for i in $(perl -pe 's/,.*//' all-routes.csv) ; do 
    jq '(.[0] | to_entries) + (.[1] | to_entries) | map(.value | { type:"Feature", geometry:{type:"Point",coordinates:[.[4],.[3]]}, properties:{id:.[0],name:.[1],seq:.[2]} } )' stops-$i.json > stops-$i.geojson
done

for i in $(perl -pe 's/,.*//' all-routes.csv) ; do 
    jq 'map({type:"LineString",coordinates:(map([.[1], .[0]])) })' route-$i.json > route-$i.geojson
done
