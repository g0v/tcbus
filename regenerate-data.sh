# https://doofenshmirtzevilincorporated.blogspot.tw/2015/06/wireshark.html
# http://v.im.cyut.edu.tw/~doofenshmirtz/timing4.php.txt

# wget -N -O data/all-routes.txt 'http://117.56.85.168/iTravel/RealRoute/aspx/RealRoute.ashx?Type=GetSelect&Lang=Cht'
#perl -pe 's#\|#\n#g; s#_##g' all-routes.txt | perl -F, -nale 'print "$F[0],[$F[2]] $F[3]" if ($F[0]<1000 && $F[3]=~/-/)' | sort -n | uniq -w 3 > all-routes.csv

#for i in $(perl -pe 's/,.*//' data/all-routes.csv) ; do wget "http://citybus.taichung.gov.tw/tcbus2/GetStopEx.php?useXno=1&json=1&routeIds=$i" -O  data/stops-$i.json ; sleep 30 ; done
#for i in $(perl -pe 's/,.*//' data/all-routes.csv) ; do wget "http://citybus.taichung.gov.tw/tcbus2/GetRoutePtsEx.php?noEncode=1&useXno=1&json=1&routeIds=$i" -O  data/route-$i.json ; sleep 30 ; done

for i in $(perl -pe 's/,.*//' data/all-routes.csv) ; do 
    jq '.[0] | to_entries | map(.value | { type:"Feature", geometry:{type:"Point",coordinates:[.[4],.[3]]}, properties:{id:.[0],name:.[1],seq:.[2]} } )' data/stops-$i.json > data/stops-$i.geojson
done

for i in $(perl -pe 's/,.*//' data/all-routes.csv) ; do 
    jq '[{type:"LineString",coordinates:(.[0] | map([.[1], .[0]]))}]' data/route-$i.json > data/route-$i.geojson
done
